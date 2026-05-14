from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import StudySession, db
from routes.helpers import (
    current_user_id,
    error_response,
    parse_date,
    validate_course_access,
)

study_session_bp = Blueprint("study_sessions", __name__)


@study_session_bp.get("")
@jwt_required()
def get_study_sessions():
    user_id = current_user_id()
    sessions = (
        StudySession.query.filter_by(user_id=user_id)
        .order_by(StudySession.session_date.desc())
        .all()
    )
    return jsonify([session.to_dict() for session in sessions])


@study_session_bp.post("")
@jwt_required()
def create_study_session():
    user_id = current_user_id()
    data = request.get_json() or {}
    course_id = data.get("course_id")
    duration_minutes = data.get("duration_minutes")

    if not duration_minutes or int(duration_minutes) <= 0:
        return error_response("Duration must be greater than 0", 400)

    _, course_error = validate_course_access(course_id, user_id)
    if course_error:
        return course_error

    session = StudySession(
        user_id=user_id,
        course_id=course_id,
        duration_minutes=int(duration_minutes),
        session_date=parse_date(data.get("session_date")) or date.today(),
        notes=data.get("notes"),
    )
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201


@study_session_bp.patch("/<int:session_id>")
@jwt_required()
def update_study_session(session_id):
    user_id = current_user_id()
    session = StudySession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return error_response("Study session not found", 404)

    data = request.get_json() or {}
    if "course_id" in data:
        _, course_error = validate_course_access(data.get("course_id"), user_id)
        if course_error:
            return course_error
        session.course_id = data.get("course_id")
    if "duration_minutes" in data:
        if int(data["duration_minutes"]) <= 0:
            return error_response("Duration must be greater than 0", 400)
        session.duration_minutes = int(data["duration_minutes"])
    if "session_date" in data:
        session.session_date = parse_date(data.get("session_date")) or date.today()
    if "notes" in data:
        session.notes = data["notes"]

    db.session.commit()
    return jsonify(session.to_dict())


@study_session_bp.delete("/<int:session_id>")
@jwt_required()
def delete_study_session(session_id):
    session = StudySession.query.filter_by(
        id=session_id, user_id=current_user_id()
    ).first()
    if not session:
        return error_response("Study session not found", 404)

    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Study session deleted"})
