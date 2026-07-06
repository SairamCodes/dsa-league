import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import db
from app.models import User, Role
from app.auth import get_password_hash


async def seed():
    db.get_engine()
    async with db.AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        if result.scalars().first():
            return
        admin = User(
            username="admin",
            full_name="Admin User",
            email="admin@dsaleague.dev",
            college="DSA Academy",
            role=Role.admin,
            hashed_password=await get_password_hash("Password123!"),
        )
        session.add(admin)
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
