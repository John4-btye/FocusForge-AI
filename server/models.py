from datetime import date, datetime
import bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class SerializerMixin:
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

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    courses = db.relationship("Course", backref="user", cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="user", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="user", cascade="all, delete-orphan")
    study_sessions = db.relationship(
        "StudySession", backref="user", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        self.password_hash = hashed.decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


class Course(db.Model, SerializerMixin):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    instructor = db.Column(db.String(120))
    color = db.Column(db.String(20), default="#2563eb", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    tasks = db.relationship("Task", backref="course", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="course", cascade="all, delete-orphan")
    study_sessions = db.relationship(
        "StudySession", backref="course", cascade="all, delete-orphan"
    )

    def to_dict(self):
        data = super().to_dict()
        data["task_count"] = len(self.tasks)
        data["note_count"] = len(self.notes)
        return data


class Task(db.Model, SerializerMixin):
    __tablename__ = "tasks"

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

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    duration_minutes = db.Column(db.Integer, nullable=False)
    session_date = db.Column(db.Date, default=date.today, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
