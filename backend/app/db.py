import os

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL =", DATABASE_URL)

# Local development uses SQLite.
# Render uses PostgreSQL via the DATABASE_URL environment variable.
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./data/dsa_league.db"

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

Base = declarative_base()

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

def get_engine() -> AsyncEngine:
    return engine

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session