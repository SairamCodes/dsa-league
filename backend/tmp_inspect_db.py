import asyncio
from sqlalchemy import select
from app.db import AsyncSessionLocal
from app.models import User, DailyEntry, Role

async def inspect():
    async with AsyncSessionLocal() as session:
        members = (await session.execute(select(User).where(User.role == Role.member))).scalars().all()
        print('members', len(members))
        for u in members:
            entries = (await session.execute(select(DailyEntry).where(DailyEntry.user_id == u.id))).scalars().all()
            print('USER', u.id, u.username, 'role', u.role, 'problems', len(entries), 'score', sum(e.score for e in entries), 'current_streak', u.current_streak, 'longest_streak', u.longest_streak)
            for e in entries:
                print('  entry', e.id, e.score, e.problem_name, e.date, e.approved)

asyncio.run(inspect())
