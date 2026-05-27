from datetime import date, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from models import StudySession, db
from routes.helpers import current_user_id

heatmap_bp = Blueprint("heatmap", __name__)


def _activity_level(minutes):
    # Forge intensity: darker days had no study, brighter days had longer sessions.
    if minutes <= 0:
        return 0
    if minutes < 30:
        return 1
    if minutes < 60:
        return 2
    if minutes < 120:
        return 3
    return 4


def _streak_ending_on(active_dates, end_day):
    streak = 0
    cursor = end_day
    while cursor in active_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _longest_streak(active_dates):
    if not active_dates:
        return 0

    longest = 0
    current = 0
    previous = None
    for active_day in sorted(active_dates):
        if previous and active_day == previous + timedelta(days=1):
            current += 1
        else:
            current = 1
        longest = max(longest, current)
        previous = active_day
    return longest


@heatmap_bp.get("")
@jwt_required()
def get_heatmap():
    # Heatmap is derived from user-owned StudySession rows, so no separate table is needed.
    user_id = current_user_id()
    today = date.today()

    try:
        selected_year = int(request.args.get("year", today.year))
    except (TypeError, ValueError):
        selected_year = today.year
    if selected_year < 1900 or selected_year > today.year:
        selected_year = today.year

    start_date = date(selected_year, 1, 1)
    end_date = date(selected_year, 12, 31)
    start_sunday = start_date - timedelta(days=(start_date.weekday() + 1) % 7)

    rows = (
        db.session.query(
            StudySession.session_date,
            func.count(StudySession.id),
            func.coalesce(func.sum(StudySession.duration_minutes), 0),
        )
        .filter(StudySession.user_id == user_id)
        .filter(StudySession.session_date >= start_date)
        .filter(StudySession.session_date <= end_date)
        .group_by(StudySession.session_date)
        .all()
    )

    activity_by_day = {
        session_date: {"sessions": int(session_count), "minutes": int(total_minutes)}
        for session_date, session_count, total_minutes in rows
    }

    days = []
    cursor = start_date
    while cursor <= end_date:
        activity = activity_by_day.get(cursor, {"sessions": 0, "minutes": 0})
        minutes = activity["minutes"]
        days.append(
            {
                "date": cursor.isoformat(),
                "minutes": minutes,
                "sessions": activity["sessions"],
                "level": _activity_level(minutes),
                "weekday": (cursor.weekday() + 1) % 7,
                "week": (cursor - start_sunday).days // 7,
                "month": cursor.strftime("%b"),
                "day": cursor.day,
            }
        )
        cursor += timedelta(days=1)

    active_dates = {
        activity_date
        for activity_date, activity in activity_by_day.items()
        if activity["minutes"] > 0
    }
    total_minutes = sum(activity["minutes"] for activity in activity_by_day.values())
    total_sessions = sum(activity["sessions"] for activity in activity_by_day.values())
    active_days = len(active_dates)
    best_day_date = max(
        active_dates,
        key=lambda active_day: activity_by_day[active_day]["minutes"],
        default=None,
    )

    if selected_year == today.year:
        streak_anchor = today if today in active_dates else today - timedelta(days=1)
    else:
        streak_anchor = max(active_dates, default=end_date)

    best_day = None
    if best_day_date:
        best_day = {
            "date": best_day_date.isoformat(),
            "minutes": activity_by_day[best_day_date]["minutes"],
            "sessions": activity_by_day[best_day_date]["sessions"],
        }

    return jsonify(
        {
            "year": selected_year,
            "days": days,
            "total_weeks": ((end_date - start_sunday).days // 7) + 1,
            "summary": {
                "total_minutes": total_minutes,
                "total_hours": round(total_minutes / 60, 1),
                "total_sessions": total_sessions,
                "active_days": active_days,
                "current_streak": _streak_ending_on(active_dates, streak_anchor),
                "longest_streak": _longest_streak(active_dates),
                "best_day": best_day,
            },
        }
    )
