from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Course, db
from routes.helpers import current_user_id, error_response

course_bp = Blueprint("courses", __name__)


@course_bp.get("")
@jwt_required()
def get_courses():
    # Ownership filter: users only receive courses they created.
    user_id = current_user_id()
    courses = Course.query.filter_by(user_id=user_id).order_by(Course.created_at.desc())
    return jsonify([course.to_dict() for course in courses])


@course_bp.post("")
@jwt_required()
def create_course():
    # Create course inside the current user's private workspace.
    user_id = current_user_id()
    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return error_response("Course name is required", 400)

    course = Course(
        user_id=user_id,
        name=name,
        subject=data.get("subject"),
        color=data.get("color") or "#2563eb",
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@course_bp.get("/<int:course_id>")
@jwt_required()
def get_course(course_id):
    # Detail view includes related task/note summaries after confirming ownership.
    course = Course.query.filter_by(id=course_id, user_id=current_user_id()).first()
    if not course:
        return error_response("Course not found", 404)
    data = course.to_dict()
    data["tasks"] = [task.to_dict() for task in course.tasks]
    data["notes"] = [note.to_dict() for note in course.notes]
    data["study_sets"] = [study_set.to_dict() for study_set in course.study_sets]
    return jsonify(data)


@course_bp.patch("/<int:course_id>")
@jwt_required()
def update_course(course_id):
    # Update guard: query by id and user_id so cross-user edits return not found.
    course = Course.query.filter_by(id=course_id, user_id=current_user_id()).first()
    if not course:
        return error_response("Course not found", 404)

    data = request.get_json() or {}
    if "name" in data:
        if not data["name"].strip():
            return error_response("Course name cannot be blank", 400)
        course.name = data["name"].strip()
    if "subject" in data:
        course.subject = data["subject"]
    if "color" in data:
        course.color = data["color"] or course.color

    db.session.commit()
    return jsonify(course.to_dict())


@course_bp.delete("/<int:course_id>")
@jwt_required()
def delete_course(course_id):
    # Delete cascades related tasks, notes, and sessions through model relationships.
    course = Course.query.filter_by(id=course_id, user_id=current_user_id()).first()
    if not course:
        return error_response("Course not found", 404)

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"})
