# FocusForge AI

FocusForge AI is a full-stack student productivity app built with React, Flask, PostgreSQL, and JWT authentication. It helps students organize courses by subject, manage academic tasks, write notes, track study sessions, use focus and break timers, and create AI-assisted flashcard and quiz collections from one dashboard.

## Technologies

- React + Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- PostgreSQL
- bcrypt
- python-dotenv
- requests
- Groq API

## Core Functionality

- User signup and login with JWT authentication
- Protected frontend routes
- Ownership-based access control so users only access their own data
- Courses CRUD using Course Name and Subject fields
- Tasks CRUD with pagination and completion tracking
- Notes CRUD with pagination
- Study session CRUD and dashboard study-time stats
- Study heatmap with yearly activity, streaks, and a copyable portfolio snapshot
- Dashboard shortcut cards that route to the matching app sections
- AI Forge chatbot for flashcards, quizzes, navigation help, explanations, and study planning
- Sidebar utility cards for the optional AI assistant and global study timer
- AI-generated study sets that can be saved as user-owned collections
- Interactive collection viewer with carousel navigation
- Clickable quiz answers with correct/incorrect feedback
- Flip-style flashcards
- Focus timer with preset/custom durations, completion sounds, and optional sidebar timer display
- Break timer mode with short break presets for recovery between study sessions
- Profile page with editable account details
- Light and dark theme support
- Optional ambient ember background animation controlled from the Profile page
- In-app modals and toast notifications for cleaner user feedback

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

Use a unique `JWT_SECRET_KEY` for your local project. The placeholder value is only an example and should never be used for a real deployment.

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

## API Routes

All protected routes require a JWT bearer token in the `Authorization` header.

- `POST /api/signup` - create a user account and return a JWT
- `POST /api/login` - log in and return a JWT
- `GET /api/me` - restore the current logged-in user
- `PATCH /api/me` - update profile details
- `GET/POST /api/courses` and `GET/PATCH/DELETE /api/courses/:id` - manage user-owned courses
- `GET/POST /api/tasks` and `GET/PATCH/DELETE /api/tasks/:id` - manage user-owned tasks
- `GET/POST /api/notes` and `GET/PATCH/DELETE /api/notes/:id` - manage user-owned notes
- `GET/POST /api/study-sessions` and `PATCH/DELETE /api/study-sessions/:id` - manage study logs
- `GET/POST /api/study-sets` and `GET/PATCH/DELETE /api/study-sets/:id` - manage saved flashcard and quiz collections
- `POST /api/ai/chat` - send a chatbot message
- `POST /api/ai/generate-study-set` - generate flashcards or quizzes
- `GET /api/dashboard` - load dashboard summary data
- `GET /api/heatmap` - load yearly study activity data
- `GET /api/health` - confirm the backend is running

## AI Setup

FocusForge AI uses Groq's free API plan with `openai/gpt-oss-120b` for the chatbot and study-set generation. Create a Groq API key, add it to `server/.env` as `GROQ_API_KEY`, then restart the Flask backend.

Free usage is rate-limited. If the default model hits limits, use this fallback in `server/.env`:

```env
GROQ_MODEL=llama-3.3-70b-versatile
```

The AI routes are protected, so users must be logged in before using the chatbot or generating study sets.

## Useful Commands

Backend route check:

```bash
cd server
venv/bin/python -m flask --app app routes
```

Frontend checks:

```bash
cd client
npm run lint
npm run build
```

## Project Notes

- The backend stores data in PostgreSQL with SQLAlchemy models and Flask-Migrate migrations.
- Study sets are user-owned collections and can optionally be assigned to a course for easier course-level review.
- The Heatmap page is generated from user-owned study-session records, so study activity persists per account without a separate tracking table.
- The normal setup path only requires `flask db upgrade`; do not run `flask db init` for a fresh clone because migrations are already included.
- The frontend keeps API calls centralized through Axios and stores auth, theme, AI, timer, and toast state in React context.
- AI API keys stay on the Flask server and are never exposed to the browser.
