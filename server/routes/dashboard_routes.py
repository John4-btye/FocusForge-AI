from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from models import Course, Note, StudySession, Task, db
from routes.helpers import current_user_id

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("")
@jwt_required()
def get_dashboard():
    user_id = current_user_id()
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    tasks = Task.query.filter_by(user_id=user_id).all()
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
    study_minutes = (
        db.session.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(StudySession.user_id == user_id)
        .filter(StudySession.session_date >= week_start)
        .scalar()
    )

    return jsonify(
        {
            "course_count": Course.query.filter_by(user_id=user_id).count(),
            "task_count": len(tasks),
            "completed_task_percentage": completed_percentage,
            "study_minutes_this_week": study_minutes,
            "upcoming_tasks": [task.to_dict() for task in upcoming_tasks],
            "recent_notes": [note.to_dict() for note in recent_notes],
            "productivity_tip": "Start with one focused 25-minute study session today.",
        }
    )
