# DSA League

DSA League is a full-stack application for students to track daily Data Structures & Algorithms practice, compete on leaderboards, and stay motivated with analytics and achievements.

## Stack

- Frontend: React, Tailwind CSS, Chart.js
- Backend: FastAPI, SQLAlchemy, SQLite, JWT Authentication

## Structure

- `backend/` - FastAPI application, models, routers, seed scripts
- `frontend/` - React dashboard, pages, API client

## Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "from app.db import engine, Base; import asyncio; asyncio.run(engine.begin().run_sync(Base.metadata.create_all))"
python app/seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

## Features

- JWT login with remember me
- Member profiles and progress metrics
- Daily entry submission with scoring rules
- Leaderboard and analytics dashboards
- Admin member management and submission approval

## Notes

- The backend uses SQLite and creates `backend/data/dsa_league.db`
- The frontend talks to `http://localhost:8000/api` by default
