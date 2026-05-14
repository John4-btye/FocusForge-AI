import json

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
    # Chat endpoint wraps Gemini with FocusForge-specific system instructions.
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []

    if not message:
        return jsonify({"error": "Message is required"}), 400

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key or api_key.startswith("replace-this"):
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
    # Only recent history is included to keep prompts short and relevant.
    prompt = f"{SYSTEM_PROMPT}\n\nRecent conversation:\n{transcript}\n\nUser: {message}\nFocusForge AI:"

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=current_app.config.get("GEMINI_MODEL"),
            contents=prompt,
        )
    except Exception as exc:
        error_text = str(exc)
        if "API_KEY_INVALID" in error_text or "API key not valid" in error_text:
            return (
                jsonify(
                    {
                        "error": "Gemini rejected the API key. Create a valid Gemini API key in Google AI Studio, update GEMINI_API_KEY in server/.env, and restart Flask."
                    }
                ),
                401,
            )
        return (
            jsonify(
                {
                    "error": "AI request failed. Check your Gemini API key, model name, and backend terminal logs."
                }
            ),
            502,
        )

    return jsonify({"reply": response.text or "I could not generate a response."})


@ai_bp.post("/generate-study-set")
@jwt_required()
def generate_study_set():
    # Structured generation endpoint returns JSON that can be saved as StudySet records.
    data = request.get_json() or {}
    topic = (data.get("topic") or "").strip()
    set_type = (data.get("set_type") or "").strip()
    count = data.get("count") or 8

    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    if set_type not in ["flashcards", "quiz"]:
        return jsonify({"error": "Set type must be flashcards or quiz"}), 400

    try:
        count = max(3, min(int(count), 20))
    except ValueError:
        count = 8

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key or api_key.startswith("replace-this"):
        return (
            jsonify(
                {
                    "error": "Gemini API key is not configured. Add GEMINI_API_KEY to server/.env and restart Flask."
                }
            ),
            503,
        )

    prompt = build_study_set_prompt(topic, set_type, count)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=current_app.config.get("GEMINI_MODEL"),
            contents=prompt,
        )
        generated = parse_json_response(response.text)
    except Exception as exc:
        error_text = str(exc)
        if "API_KEY_INVALID" in error_text or "API key not valid" in error_text:
            return (
                jsonify(
                    {
                        "error": "Gemini rejected the API key. Create a valid Gemini API key in Google AI Studio, update GEMINI_API_KEY in server/.env, and restart Flask."
                    }
                ),
                401,
            )
        return jsonify({"error": "AI generation failed. Try a clearer topic."}), 502

    return jsonify(generated)


def build_study_set_prompt(topic, set_type, count):
    # Prompt branch controls the expected item shape for flashcards vs quizzes.
    if set_type == "flashcards":
        item_instruction = """
Each item must have:
- prompt: the front of the flashcard
- answer: the back of the flashcard
- choices: null
"""
    else:
        item_instruction = """
Each item must have:
- prompt: a quiz question
- answer: the correct answer
- choices: an array of 4 answer choices including the correct answer
"""

    return f"""
Create a student study set about: {topic}
Set type: {set_type}
Number of items: {count}

Return only valid JSON. Do not include markdown fences.

JSON shape:
{{
  "title": "short study set title",
  "topic": "{topic}",
  "set_type": "{set_type}",
  "items": [
    {{
      "prompt": "...",
      "answer": "...",
      "choices": null
    }}
  ]
}}

{item_instruction}
Keep wording clear and useful for a student reviewing the topic.
"""


def parse_json_response(text):
    # Gemini may wrap JSON in markdown, so this extracts the first JSON object safely.
    if not text:
        raise ValueError("Empty AI response")

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json\n", "", 1).replace("JSON\n", "", 1)

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("AI response did not include JSON")

    payload = json.loads(cleaned[start : end + 1])
    items = payload.get("items") or []
    # Normalize AI output before the frontend previews or saves it.
    payload["items"] = [
        {
            "prompt": (item.get("prompt") or "").strip(),
            "answer": (item.get("answer") or "").strip(),
            "choices": item.get("choices"),
        }
        for item in items
        if item.get("prompt") and item.get("answer")
    ]
    return payload
