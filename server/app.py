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
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5174",
                ],
                "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

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
        return jsonify({"status": "ok", "message": "FocusForge API is running"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
