from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from models import Course, Note, StudySession, StudySet, Task, db
from routes.helpers import current_user_id

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("")
@jwt_required()
def get_dashboard():
    # Dashboard aggregates several user-owned resources into one frontend payload.
    user_id = current_user_id()
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    tasks = Task.query.filter_by(user_id=user_id).all()
    # Completion percentage is calculated in Python from the user's task list.
    completed_count = len([task for task in tasks if task.completed])
    completed_percentage = round((completed_count / len(tasks)) * 100) if tasks else 0

    upcoming_tasks = (
        Task.query.filter_by(user_id=user_id, completed=False)
        .filter(Task.due_date >= today)
        .order_by(Task.due_date.asc())
        .limit(5)
        .all()
    )
    recent_notes = (
        Note.query.filter_by(user_id=user_id)
        .order_by(Note.updated_at.desc())
        .limit(5)
        .all()
    )
    # Study minutes are summed in SQL so the dashboard does not load every session.
    study_minutes = (
        db.session.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(StudySession.user_id == user_id)
        .filter(StudySession.session_date >= week_start)
        .scalar()
    )
    weekly_study_goal = 150
    weekly_study_percentage = min(round((study_minutes / weekly_study_goal) * 100), 100)

    recent_study_sets = (
        StudySet.query.filter_by(user_id=user_id)
        .order_by(StudySet.created_at.desc())
        .limit(4)
        .all()
    )
    courses = Course.query.filter_by(user_id=user_id).order_by(Course.created_at.desc()).all()
    course_summaries = [
        {
            "id": course.id,
            "name": course.name,
            "subject": course.instructor,
            "color": course.color,
            "task_count": len(course.tasks),
            "note_count": len(course.notes),
            "study_set_count": len(course.study_sets),
        }
        for course in courses[:4]
    ]
    next_task = upcoming_tasks[0].to_dict() if upcoming_tasks else None

    if next_task:
        next_action = f"Start with {next_task['title']}."
    elif study_minutes < weekly_study_goal:
        next_action = "Run a focused study timer to build this week's momentum."
    elif recent_study_sets:
        next_action = "Review a saved study set while the material is fresh."
    else:
        next_action = "Add a task, note, or study set to shape your next session."

    return jsonify(
        {
            "course_count": len(courses),
            "task_count": len(tasks),
            "completed_task_percentage": completed_percentage,
            "study_set_count": StudySet.query.filter_by(user_id=user_id).count(),
            "study_minutes_this_week": study_minutes,
            "weekly_study_goal": weekly_study_goal,
            "weekly_study_percentage": weekly_study_percentage,
            "next_task": next_task,
            "upcoming_tasks": [task.to_dict() for task in upcoming_tasks],
            "recent_notes": [note.to_dict() for note in recent_notes],
            "recent_study_sets": [study_set.to_dict() for study_set in recent_study_sets],
            "course_summaries": course_summaries,
            "next_action": next_action,
            "productivity_tip": "Start with one focused 25-minute study session today.",
        }
    )
