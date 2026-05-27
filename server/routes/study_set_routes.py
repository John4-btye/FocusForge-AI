from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import StudySet, StudySetItem, db
from routes.helpers import current_user_id, error_response, validate_course_access

study_set_bp = Blueprint("study_sets", __name__)


@study_set_bp.get("")
@jwt_required()
def get_study_sets():
    # List view returns saved set metadata without all flashcard/question items.
    user_id = current_user_id()
    sets = (
        StudySet.query.filter_by(user_id=user_id)
        .order_by(StudySet.created_at.desc())
        .all()
    )
    return jsonify([study_set.to_dict() for study_set in sets])


@study_set_bp.post("")
@jwt_required()
def create_study_set():
    # Save an AI-generated study set and its individual items in one transaction.
    user_id = current_user_id()
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    topic = (data.get("topic") or "").strip()
    set_type = (data.get("set_type") or "").strip()
    course_id = data.get("course_id")
    items = data.get("items") or []

    if not title or not topic or set_type not in ["flashcards", "quiz"]:
        return error_response("Title, topic, and valid set type are required", 400)
    if not items:
        return error_response("At least one item is required", 400)

    course, course_error = validate_course_access(course_id, user_id)
    if course_error:
        return course_error

    study_set = StudySet(
        user_id=user_id,
        course_id=course.id if course else None,
        title=title,
        topic=topic,
        set_type=set_type,
    )
    db.session.add(study_set)
    db.session.flush()

    # Flush gives study_set.id before inserting child items.
    for index, item in enumerate(items, start=1):
        prompt = (item.get("prompt") or "").strip()
        answer = (item.get("answer") or "").strip()
        if not prompt or not answer:
            continue
        db.session.add(
            StudySetItem(
                study_set_id=study_set.id,
                prompt=prompt,
                answer=answer,
                choices=item.get("choices"),
                position=index,
            )
        )

    db.session.commit()
    return jsonify(study_set.to_dict(include_items=True)), 201


@study_set_bp.get("/<int:set_id>")
@jwt_required()
def get_study_set(set_id):
    # Detail view includes child items after ownership is confirmed.
    study_set = StudySet.query.filter_by(id=set_id, user_id=current_user_id()).first()
    if not study_set:
        return error_response("Study set not found", 404)
    return jsonify(study_set.to_dict(include_items=True))


@study_set_bp.patch("/<int:set_id>")
@jwt_required()
def update_study_set(set_id):
    # Reassignment lets saved sets move into or out of a course without changing items.
    user_id = current_user_id()
    study_set = StudySet.query.filter_by(id=set_id, user_id=user_id).first()
    if not study_set:
        return error_response("Study set not found", 404)

    data = request.get_json() or {}
    if "course_id" in data:
        course_id = data.get("course_id")
        course, course_error = validate_course_access(course_id, user_id)
        if course_error:
            return course_error
        study_set.course_id = course.id if course else None

    db.session.commit()
    return jsonify(study_set.to_dict(include_items=True))


@study_set_bp.delete("/<int:set_id>")
@jwt_required()
def delete_study_set(set_id):
    # Deleting a set cascades to its saved flashcards/questions.
    study_set = StudySet.query.filter_by(id=set_id, user_id=current_user_id()).first()
    if not study_set:
        return error_response("Study set not found", 404)

    db.session.delete(study_set)
    db.session.commit()
    return jsonify({"message": "Study set deleted"})
