from datetime import date, datetime
import bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class SerializerMixin:
    # Shared serializer used by models that can safely expose their columns as JSON.
    def to_dict(self):
        return {
            column.name: self._serialize_value(getattr(self, column.name))
            for column in self.__table__.columns
        }

    def _serialize_value(self, value):
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    # Authentication identity fields.
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Ownership relationships: deleting a user removes their private workspace data.
    courses = db.relationship("Course", backref="user", cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="user", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="user", cascade="all, delete-orphan")
    study_sessions = db.relationship(
        "StudySession", backref="user", cascade="all, delete-orphan"
    )
    study_sets = db.relationship("StudySet", backref="user", cascade="all, delete-orphan")

    def set_password(self, password):
        # Passwords are stored as bcrypt hashes, never as raw strings.
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        self.password_hash = hashed.decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        # Public user payload intentionally omits password_hash.
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


class Course(db.Model, SerializerMixin):
    __tablename__ = "courses"

    # Course is the parent resource for course-specific tasks, notes, and sessions.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(120))
    color = db.Column(db.String(20), default="#2563eb", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Course children cascade so deleting a course cleans up related records.
    tasks = db.relationship("Task", backref="course", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="course", cascade="all, delete-orphan")
    study_sessions = db.relationship(
        "StudySession", backref="course", cascade="all, delete-orphan"
    )
    study_sets = db.relationship("StudySet", backref="course")

    def to_dict(self):
        # Add lightweight counts so the frontend can render course summary cards.
        data = super().to_dict()
        data["task_count"] = len(self.tasks)
        data["note_count"] = len(self.notes)
        return data


class Task(db.Model, SerializerMixin):
    __tablename__ = "tasks"

    # Task supports assignment tracking, due dates, priority, and completion state.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)
    priority = db.Column(db.String(20), default="medium", nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Note(db.Model, SerializerMixin):
    __tablename__ = "notes"

    # Notes belong to users and can optionally be attached to a course.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    title = db.Column(db.String(160), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class StudySession(db.Model, SerializerMixin):
    __tablename__ = "study_sessions"

    # Study sessions power timer logs and dashboard study-time totals.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    duration_minutes = db.Column(db.Integer, nullable=False)
    session_date = db.Column(db.Date, default=date.today, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class StudySet(db.Model, SerializerMixin):
    __tablename__ = "study_sets"

    # AI-generated flashcard/quiz collection metadata.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    title = db.Column(db.String(160), nullable=False)
    topic = db.Column(db.String(220), nullable=False)
    set_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Items are stored separately so each card/question can be rendered and reviewed.
    items = db.relationship("StudySetItem", backref="study_set", cascade="all, delete-orphan")

    def to_dict(self, include_items=False):
        # include_items keeps list views small while detail views can request full content.
        data = super().to_dict()
        data["item_count"] = len(self.items)
        if include_items:
            data["items"] = [item.to_dict() for item in self.items]
        return data


class StudySetItem(db.Model, SerializerMixin):
    __tablename__ = "study_set_items"

    # A single flashcard or quiz question inside a saved study set.
    id = db.Column(db.Integer, primary_key=True)
    study_set_id = db.Column(db.Integer, db.ForeignKey("study_sets.id"), nullable=False)
    prompt = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    choices = db.Column(db.JSON)
    position = db.Column(db.Integer, nullable=False)
