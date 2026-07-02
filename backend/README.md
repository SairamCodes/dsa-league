# DSA League Backend

## Overview

FastAPI backend for DSA League. Provides JWT authentication, member profiles, daily entry submission, leaderboard analytics, and admin controls.

## Setup

1. Create a Python virtual environment.
2. Install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Run migrations / database creation:

```powershell
python -c "from app.db import engine, Base; import asyncio; asyncio.run(engine.begin().run_sync(Base.metadata.create_all))"
python app/seed.py
```

4. Start the server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/me`
- `POST /api/entries/submit`
- `GET /api/entries/leaderboard`
- `GET /api/reports/analytics`
- `GET /api/admin/members`

## Notes

- Uses SQLite by default in `backend/data/dsa_league.db`
- JWT secret is configured from `SECRET_KEY`
