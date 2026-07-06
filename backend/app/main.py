from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, entries, reports, admin
from app.db import get_engine, Base, _get_database_url
from app.seed import seed
from sqlalchemy.exc import OperationalError
import os
import urllib.parse

app = FastAPI(title="DSA League API", version="1.0.0")

origins = [
    "http://localhost:3000",
    "https://dsaleague1.netlify.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    engine = get_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    try:
        await seed()
    except OperationalError:
        # If the SQLite database schema is out-of-date (missing columns),
        # recreate the local DB file and re-run migrations + seed.
        database_url = _get_database_url()
        if database_url and database_url.startswith("sqlite"):
            # extract path after sqlite+aiosqlite:///
            path = urllib.parse.unquote(database_url.split("///", 1)[-1])
            if os.path.exists(path):
                os.remove(path)
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            await seed()
        else:
            raise
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(entries.router, prefix="/api/entries", tags=["entries"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
