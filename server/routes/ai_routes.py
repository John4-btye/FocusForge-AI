from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required
from google import genai

ai_bp = Blueprint("ai", __name__)

SYSTEM_PROMPT = """
You are FocusForge AI, a student productivity assistant inside a course, task,
note, and study-session app. Be practical, encouraging, and concise.

You can help users:
- create flashcards from notes or topics
- write short quizzes with answers
- explain concepts and study strategies
- help navigate the app
- plan tasks, courses, notes, and study sessions

When creating flashcards, use a clear "Front:" and "Back:" format.
When creating quizzes, number the questions and include an answer key.
When giving navigation help, reference these app areas: Dashboard, Courses,
Tasks, Notes, and Study Sessions.
Do not claim you changed the user's data unless they ask for instructions;
you can guide them through what to click or what to enter.
"""


@ai_bp.post("/chat")
@jwt_required()
def chat():
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []

    if not message:
        return jsonify({"error": "Message is required"}), 400

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        return (
            jsonify(
                {
                    "error": "Gemini API key is not configured. Add GEMINI_API_KEY to server/.env and restart Flask."
                }
            ),
            503,
        )

    transcript = "\n".join(
        f"{item.get('role', 'user').title()}: {item.get('content', '')}"
        for item in history[-8:]
        if item.get("content")
    )
    prompt = f"{SYSTEM_PROMPT}\n\nRecent conversation:\n{transcript}\n\nUser: {message}\nFocusForge AI:"

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=current_app.config.get("GEMINI_MODEL"),
            contents=prompt,
        )
    except Exception as exc:
        return jsonify({"error": f"AI request failed: {str(exc)}"}), 502

    return jsonify({"reply": response.text or "I could not generate a response."})
