import os

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker


# Local SQLite database
DEFAULT_SQLITE = "sqlite+aiosqlite:///./data/dsa_league.db"

engine: AsyncEngine | None = None

Base = declarative_base()

AsyncSessionLocal: sessionmaker | None = None


def _get_database_url() -> str:
    # Always read the latest DATABASE_URL
    return os.getenv("DATABASE_URL") or DEFAULT_SQLITE


def get_engine() -> AsyncEngine:
    global engine, AsyncSessionLocal

    if engine is None:

        engine = create_async_engine(
            _get_database_url(),
            echo=False,
            future=True,
        )

        AsyncSessionLocal = sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    return engine


async def get_session():

    # Ensure engine/sessionmaker exist
    get_engine()

    assert AsyncSessionLocal is not None

    async with AsyncSessionLocal() as session:
        yield session