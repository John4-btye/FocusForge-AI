from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Note, db
from routes.helpers import current_user_id, error_response, validate_course_access

note_bp = Blueprint("notes", __name__)


@note_bp.get("")
@jwt_required()
def get_notes():
    user_id = current_user_id()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    per_page = min(per_page, 50)

    pagination = (
        Note.query.filter_by(user_id=user_id)
        .order_by(Note.updated_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify(
        {
            "items": [note.to_dict() for note in pagination.items],
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        }
    )


@note_bp.post("")
@jwt_required()
def create_note():
    user_id = current_user_id()
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    course_id = data.get("course_id")

    if not title or not content:
        return error_response("Note title and content are required", 400)

    _, course_error = validate_course_access(course_id, user_id)
    if course_error:
        return course_error

    note = Note(user_id=user_id, course_id=course_id, title=title, content=content)
    db.session.add(note)
    db.session.commit()
    return jsonify(note.to_dict()), 201


@note_bp.get("/<int:note_id>")
@jwt_required()
def get_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user_id()).first()
    if not note:
        return error_response("Note not found", 404)
    return jsonify(note.to_dict())


@note_bp.patch("/<int:note_id>")
@jwt_required()
def update_note(note_id):
    user_id = current_user_id()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return error_response("Note not found", 404)

    data = request.get_json() or {}
    if "course_id" in data:
        _, course_error = validate_course_access(data.get("course_id"), user_id)
        if course_error:
            return course_error
        note.course_id = data.get("course_id")
    if "title" in data:
        if not data["title"].strip():
            return error_response("Note title cannot be blank", 400)
        note.title = data["title"].strip()
    if "content" in data:
        if not data["content"].strip():
            return error_response("Note content cannot be blank", 400)
        note.content = data["content"].strip()

    db.session.commit()
    return jsonify(note.to_dict())


@note_bp.delete("/<int:note_id>")
@jwt_required()
def delete_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user_id()).first()
    if not note:
        return error_response("Note not found", 404)

    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Note deleted"})
