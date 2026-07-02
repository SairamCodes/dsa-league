from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "dsa_league.db"

print("Database file:", DB_PATH)

DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"

database = type("Database", (), {})()
DatabaseEngine = None

engine: AsyncEngine = create_async_engine(DATABASE_URL, future=True, echo=False)

Base = declarative_base()
AsyncSessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

def get_engine() -> AsyncEngine:
    return engine

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
