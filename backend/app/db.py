import os

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)

from sqlalchemy.orm import declarative_base, sessionmaker


def _get_database_url():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")

    return database_url


engine: AsyncEngine | None = None

Base = declarative_base()

AsyncSessionLocal: sessionmaker | None = None


def _get_database_url() -> str:
    return os.getenv("DATABASE_URL") or DEFAULT_DATABASE_URL


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

    get_engine()

    assert AsyncSessionLocal is not None

    async with AsyncSessionLocal() as session:
        yield session