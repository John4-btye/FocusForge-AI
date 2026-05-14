from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Task, db
from routes.helpers import (
    current_user_id,
    error_response,
    parse_date,
    validate_course_access,
)

task_bp = Blueprint("tasks", __name__)


@task_bp.get("")
@jwt_required()
def get_tasks():
    user_id = current_user_id()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    per_page = min(per_page, 50)

    pagination = (
        Task.query.filter_by(user_id=user_id)
        .order_by(Task.completed.asc(), Task.due_date.asc().nullslast())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify(
        {
            "items": [task.to_dict() for task in pagination.items],
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        }
    )


@task_bp.post("")
@jwt_required()
def create_task():
    user_id = current_user_id()
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    course_id = data.get("course_id")

    if not title:
        return error_response("Task title is required", 400)

    _, course_error = validate_course_access(course_id, user_id)
    if course_error:
        return course_error

    task = Task(
        user_id=user_id,
        course_id=course_id,
        title=title,
        description=data.get("description"),
        due_date=parse_date(data.get("due_date")),
        priority=data.get("priority") or "medium",
        completed=bool(data.get("completed", False)),
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@task_bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user_id()).first()
    if not task:
        return error_response("Task not found", 404)
    return jsonify(task.to_dict())


@task_bp.patch("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = current_user_id()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return error_response("Task not found", 404)

    data = request.get_json() or {}
    if "course_id" in data:
        _, course_error = validate_course_access(data.get("course_id"), user_id)
        if course_error:
            return course_error
        task.course_id = data.get("course_id")
    if "title" in data:
        if not data["title"].strip():
            return error_response("Task title cannot be blank", 400)
        task.title = data["title"].strip()
    if "description" in data:
        task.description = data["description"]
    if "due_date" in data:
        task.due_date = parse_date(data.get("due_date"))
    if "priority" in data:
        task.priority = data["priority"] or "medium"
    if "completed" in data:
        task.completed = bool(data["completed"])

    db.session.commit()
    return jsonify(task.to_dict())


@task_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user_id()).first()
    if not task:
        return error_response("Task not found", 404)

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})
