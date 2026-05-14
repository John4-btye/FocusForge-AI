from app import app
from models import Course, Note, StudySession, Task, User, db


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        user = User(username="demo", email="demo@example.com")
        user.set_password("password123")
        db.session.add(user)
        db.session.flush()

        course = Course(
            user_id=user.id, name="Capstone Project", instructor="Professor", color="#0f766e"
        )
        db.session.add(course)
        db.session.flush()

        db.session.add_all(
            [
                Task(
                    user_id=user.id,
                    course_id=course.id,
                    title="Finalize FocusForge MVP",
                    priority="high",
                ),
                Note(
                    user_id=user.id,
                    course_id=course.id,
                    title="Project idea",
                    content="FocusForge AI helps students manage courses, tasks, and notes.",
                ),
                StudySession(
                    user_id=user.id,
                    course_id=course.id,
                    duration_minutes=45,
                    notes="Outlined project features.",
                ),
            ]
        )
        db.session.commit()


if __name__ == "__main__":
    seed()
