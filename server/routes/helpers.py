from datetime import date
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from models import Course


def current_user_id():
    # JWT identities are stored as strings, so routes normalize them to integers.
    return int(get_jwt_identity())


def error_response(message, status_code):
    return jsonify({"error": message}), status_code


def parse_date(value, field_name="Date"):
    # Empty date inputs from forms should become null database values.
    if not value:
        return None, None
    try:
        return date.fromisoformat(value), None
    except (TypeError, ValueError):
        return None, error_response(f"{field_name} must use YYYY-MM-DD format", 400)


def parse_positive_int(value, field_name):
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None, error_response(f"{field_name} must be a valid number", 400)

    if number <= 0:
        return None, error_response(f"{field_name} must be greater than 0", 400)
    return number, None


def parse_optional_int(value, field_name):
    if value in (None, ""):
        return None, None
    try:
        return int(value), None
    except (TypeError, ValueError):
        return None, error_response(f"{field_name} must be a valid number", 400)


def get_owned_course(course_id, user_id):
    # Ownership helper prevents linking tasks/notes/sessions to another user's course.
    if not course_id:
        return None
    return Course.query.filter_by(id=course_id, user_id=user_id).first()


def validate_course_access(course_id, user_id):
    # Shared guard for routes that accept optional course_id values.
    normalized_course_id, id_error = parse_optional_int(course_id, "Course")
    if id_error:
        return None, id_error
    if not normalized_course_id:
        return None, None

    course = get_owned_course(normalized_course_id, user_id)
    if not course:
        return None, error_response("Course not found", 404)
    return course, None
