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
- Google Gemini API

## Setup

### Backend

```bash
cd server
source venv/bin/activate
createdb focusforge_ai
flask db init
flask db migrate -m "Initial tables"
flask db upgrade
flask run
```

Create `server/.env` first:

```env
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/focusforge_ai
JWT_SECRET_KEY=replace-this-with-a-secret-key
GEMINI_API_KEY=replace-this-with-your-google-ai-studio-key
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env` if the backend URL changes:

```env
VITE_API_URL=http://localhost:5000/api
```

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

FocusForge AI uses Gemini 2.5 Flash for the chatbot. Create a free Gemini API key in Google AI Studio, add it to `server/.env` as `GEMINI_API_KEY`, then restart the Flask backend.

The AI route is protected, so users must be logged in before using the chatbot.
