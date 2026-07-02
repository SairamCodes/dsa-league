import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import AsyncSessionLocal, engine
from app.models import User, Role, DailyEntry, Achievement, Platform, Pattern, Difficulty, AchievementType
from app.auth import get_password_hash

users = [
    {"username": "admin", "full_name": "Admin User", "email": "admin@dsaleague.dev", "college": "DSA Academy", "role": Role.admin},
    {"username": "alice", "full_name": "Alice Johnson", "email": "alice@dsaleague.dev", "college": "Tech University", "role": Role.member},
    {"username": "bob", "full_name": "Bob Lee", "email": "bob@dsaleague.dev", "college": "Code Institute", "role": Role.member},
    {"username": "carla", "full_name": "Carla Gomez", "email": "carla@dsaleague.dev", "college": "Algorithm College", "role": Role.member},
]

async def seed():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        if result.scalars().first():
            return
        for item in users:
            user = User(
                username=item["username"],
                full_name=item["full_name"],
                email=item["email"],
                college=item["college"],
                role=item["role"],
                hashed_password=await get_password_hash("Password123!"),
            )
            session.add(user)
        await session.commit()
        users_db = (await session.execute(select(User))).scalars().all()
        for idx, user in enumerate(users_db[1:], start=1):
            entry = DailyEntry(
                user_id=user.id,
                platform=Platform.leetcode,
                problem_number=f"LC{idx*10}",
                problem_name="Sample Challenge",
                problem_link="https://leetcode.com/problem/sample",
                pattern=Pattern.arrays,
                difficulty=Difficulty.medium,
                time_taken=25,
                solved=True,
                without_solution=True,
                revision=False,
                notes="Sample entry for seed data.",
                score=20,
                approved=True,
            )
            session.add(entry)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed())
