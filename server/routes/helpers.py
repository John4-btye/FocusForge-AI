from datetime import date
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from models import Course


def current_user_id():
    return int(get_jwt_identity())


def error_response(message, status_code):
    return jsonify({"error": message}), status_code


def parse_date(value):
    if not value:
        return None
    return date.fromisoformat(value)


def get_owned_course(course_id, user_id):
    if not course_id:
        return None
    return Course.query.filter_by(id=course_id, user_id=user_id).first()


def validate_course_access(course_id, user_id):
    if not course_id:
        return None, None
    course = get_owned_course(course_id, user_id)
    if not course:
        return None, error_response("Course not found", 404)
    return course, None
