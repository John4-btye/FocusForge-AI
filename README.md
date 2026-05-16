# FocusForge AI

FocusForge AI is a full-stack student productivity app built with React, Flask, PostgreSQL, and JWT authentication. It helps students organize courses, manage academic tasks, write notes, track study sessions, and review productivity insights from one dashboard.

## Technologies

- React + Vite
- Tailwind CSS
- React Router
- Axios
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- PostgreSQL
- Groq API

## Setup And Run Instructions

Clone the repository, then set up the backend and frontend in separate terminal windows.

### Backend

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
createdb focusforge_ai
flask db upgrade
```

Create `server/.env`:

```env
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/focusforge_ai
JWT_SECRET_KEY=replace-this-with-a-secret-key
GROQ_API_KEY=replace-this-with-your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
```

Start the Flask API on port `5002`:

```bash
venv/bin/python -m flask --app app run --port 5002
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5002/api
```

Start the React app:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Core Functionality

- User signup and login with JWT authentication
- Protected frontend routes
- Ownership-based access control
- Courses CRUD
- Tasks CRUD with pagination
- Notes CRUD with pagination
- Study session CRUD
- Dashboard summary data
- AI Forge chatbot for flashcards, quizzes, navigation help, explanations, and study planning

## AI Setup

FocusForge AI uses Groq's free API plan with `openai/gpt-oss-120b` for the chatbot. Create a Groq API key, add it to `server/.env` as `GROQ_API_KEY`, then restart the Flask backend. Free usage is rate-limited, so `llama-3.3-70b-versatile` can be used as `GROQ_MODEL` if the default model hits limits.

The AI route is protected, so users must be logged in before using the chatbot.
