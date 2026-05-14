from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.ai_routes import ai_bp
from routes.course_routes import course_bp
from routes.dashboard_routes import dashboard_bp
from routes.note_routes import note_bp
from routes.study_session_routes import study_session_bp
from routes.study_set_routes import study_set_bp
from routes.task_routes import task_bp

migrate = Migrate()
jwt = JWTManager()


def create_app():
    # App factory: builds the Flask app, loads config, and wires every extension/route.
    app = Flask(__name__)
    app.config.from_object(Config)
    # Development CORS whitelist: Vite may shift ports when one is already in use.
    vite_dev_origins = [
        origin
        for port in range(5173, 5180)
        for origin in (f"http://localhost:{port}", f"http://127.0.0.1:{port}")
    ]

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # API-only CORS configuration keeps browser calls from React allowed while staying scoped.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": vite_dev_origins,
                "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    # Blueprint registration: each feature owns its own REST route group.
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(course_bp, url_prefix="/api/courses")
    app.register_blueprint(task_bp, url_prefix="/api/tasks")
    app.register_blueprint(note_bp, url_prefix="/api/notes")
    app.register_blueprint(study_session_bp, url_prefix="/api/study-sessions")
    app.register_blueprint(study_set_bp, url_prefix="/api/study-sets")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    @app.get("/api/health")
    def health_check():
        # Lightweight endpoint for confirming the backend is running.
        return jsonify({"status": "ok", "message": "FocusForge API is running"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
