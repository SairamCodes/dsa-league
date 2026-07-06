import os
import json
import asyncio

import pytest
from httpx import AsyncClient, ASGITransport


import importlib
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


def setup_test_db():
    # Use a temporary file-backed SQLite DB for tests to avoid
    # in-memory engine isolation across imports/lifespans.
    test_db = os.path.join(os.getcwd(), "tests", "test_db.sqlite")
    os.makedirs(os.path.dirname(test_db), exist_ok=True)
    if os.path.exists(test_db):
        os.remove(test_db)
    db_url = f"sqlite+aiosqlite:///{test_db}"
    os.environ["DATABASE_URL"] = db_url
    return db_url


# Ensure the test DATABASE_URL is set as early as possible (module import time)
# so any subsequent imports of `app.db` see the correct test DB URL.
TEST_DB_URL = setup_test_db()


def build_test_app(db_url: str):
    # Import the app.db module and replace its engine/sessionmaker
    import app.db as app_db

    # create a single engine for tests and inject into app.db
    engine = create_async_engine(db_url, echo=False, future=True)
    app_db.engine = engine
    app_db.AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    # reload main to ensure routers are registered with the patched db module
    import app.main
    importlib.reload(app.main)
    return app.main.app, engine


def run_async(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_full_flow_register_submit_leaderboard_delete():
    db_url = setup_test_db()
    print("TEST: os.environ[DATABASE_URL] =", os.getenv("DATABASE_URL"))
    app, engine = build_test_app(db_url)
    import app.db as app_db
    print("TEST: app.db._get_database_url() =", app_db._get_database_url())

    # Ensure database tables are created on the test engine before tests
    from app.db import Base

    async def _create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    run_async(_create_tables())

    async def flow():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # register user
            username = "pytestuser"
            resp = await client.post(
                "/api/auth/register",
                json={
                    "username": username,
                    "full_name": "Py Test",
                    "email": f"{username}@example.com",
                    "password": "Password123!",
                    "college": "TestU",
                },
            )
            assert resp.status_code == 200

            # login
            r = await client.post(
                "/api/auth/login",
                json={"username": username, "password": "Password123!", "remember_me": False},
            )
            assert r.status_code == 200
            token = r.json().get("access_token")
            assert token

            headers = {"Authorization": f"Bearer {token}"}

            # submit one entry
            entry = {
                "platform": "LeetCode",
                "problem_number": "1",
                "problem_name": "A",
                "problem_link": "https://example.com",
                "pattern": "Arrays",
                "difficulty": "Medium",
                "time_taken": 30,
                "solved": True,
                "without_solution": False,
                "revision": False,
                "notes": "one",
            }
            s1 = await client.post("/api/entries/submit", json=entry, headers=headers)
            assert s1.status_code == 200

            # profile should show 1 problem and positive score
            prof = await client.get("/api/users/me", headers=headers)
            assert prof.status_code == 200
            pd = prof.json()
            assert pd["total_problems"] == 1
            assert pd["current_score"] > 0

            # leaderboard must include the user and have matching score/problems
            board = await client.get("/api/entries/leaderboard", headers=headers)
            assert board.status_code == 200
            b = board.json()
            # find our user in leaderboard
            me = next((i for i in b if i["username"] == username), None)
            assert me is not None
            assert me["score"] == pd["current_score"]
            assert me["problems_solved"] == pd["total_problems"]

            # login as admin (seed creates admin)
            admin_login = await client.post(
                "/api/auth/login",
                json={"username": "admin", "password": "Password123!", "remember_me": False},
            )
            assert admin_login.status_code == 200
            admin_token = admin_login.json().get("access_token")
            assert admin_token

            # admin members list should contain the user
            adm = await client.get("/api/admin/members", headers={"Authorization": f"Bearer {admin_token}"})
            assert adm.status_code == 200
            mems = adm.json()
            assert any(u["username"] == username for u in mems)

            # delete the user
            uid = pd["id"]
            dr = await client.delete(f"/api/admin/members/{uid}", headers={"Authorization": f"Bearer {admin_token}"})
            assert dr.status_code == 200

            # ensure user removed from admin list
            adm2 = await client.get("/api/admin/members", headers={"Authorization": f"Bearer {admin_token}"})
            assert not any(u["username"] == username for u in adm2.json())

    run_async(flow())
