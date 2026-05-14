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

## Later Enhancement

The AI Study Summary Generator will be added after the MVP is working.
