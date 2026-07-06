from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_active_user
from app.db import get_session
from app.models import DailyEntry, Role, User
from app.schemas import (
    DailyEntryCreate,
    DailyEntryRead,
    LeaderboardItem,
)
from app.models import Achievement, AchievementType
from app.utils.statistics import build_leaderboard
from app.utils.scoring import calculate_score
from datetime import datetime, timedelta

router = APIRouter()


# Score calculation moved to `app.utils.scoring.calculate_score`


# -----------------------------
# Submit Entry
# -----------------------------

@router.post("/submit", response_model=DailyEntryRead)
async def submit_entry(
    payload: DailyEntryCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role != Role.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only members can submit entries.",
        )

    today = datetime.utcnow().date()

    result = await session.execute(
        select(DailyEntry).where(
            DailyEntry.user_id == current_user.id,
            DailyEntry.date >= today,
        )
    )

    count_today = len(result.scalars().all()) + 1

    score = calculate_score(
        payload,
        count_today,
    )

    entry = DailyEntry(
        user_id=current_user.id,
        platform=payload.platform,
        problem_number=payload.problem_number,
        problem_name=payload.problem_name,
        problem_link=str(payload.problem_link),
        pattern=payload.pattern,
        difficulty=payload.difficulty,
        time_taken=payload.time_taken,
        solved=payload.solved,
        without_solution=payload.without_solution,
        revision=payload.revision,
        notes=payload.notes,
        score=score,
        approved=True,
    )

    session.add(entry)

    await session.commit()

    await session.refresh(entry)

    # After auto-accepting, update user streaks and achievements
    result = await session.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()

    today = datetime.utcnow().date()

    if user.last_submission_date is None:
        user.current_streak = 1
        user.longest_streak = max(user.longest_streak or 0, 1)
    else:
        last_date = user.last_submission_date.date()
        if last_date == today:
            pass
        elif last_date == today - timedelta(days=1):
            user.current_streak = (user.current_streak or 0) + 1
        else:
            user.current_streak = 1

        if (user.longest_streak or 0) < user.current_streak:
            user.longest_streak = user.current_streak

    user.last_submission_date = datetime.utcnow()

    # Check and create achievements
    entries = (await session.execute(select(DailyEntry).where(DailyEntry.user_id == user.id))).scalars().all()
    total = len(entries)

    # helper to ensure achievement exists
    async def ensure_achievement(u_id, a_type: AchievementType):
        exists = (await session.execute(select(Achievement).where(Achievement.user_id == u_id, Achievement.type == a_type))).scalars().first()
        if not exists:
            ach = Achievement(user_id=u_id, type=a_type)
            session.add(ach)

    # First problem
    if total == 1:
        await ensure_achievement(user.id, AchievementType.first_problem)

    # Milestone problem counts
    if total >= 100:
        await ensure_achievement(user.id, AchievementType.one_hundred_problems)
    if total >= 250:
        await ensure_achievement(user.id, AchievementType.two_fifty_problems)
    if total >= 500:
        await ensure_achievement(user.id, AchievementType.five_hundred_problems)
    if total >= 1000:
        await ensure_achievement(user.id, AchievementType.one_thousand_problems)

    # Streak achievements
    if user.current_streak >= 7:
        await ensure_achievement(user.id, AchievementType.seven_day_streak)
    if user.current_streak >= 15:
        await ensure_achievement(user.id, AchievementType.fifteen_day_streak)
    if user.current_streak >= 30:
        await ensure_achievement(user.id, AchievementType.thirty_day_streak)

    await session.commit()
    return entry


# -----------------------------
# My Entries
# -----------------------------

@router.get("/mine", response_model=list[DailyEntryRead])
async def my_entries(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role != Role.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only members can access their entries.",
        )

    result = await session.execute(
        select(DailyEntry)
        .where(DailyEntry.user_id == current_user.id)
        .order_by(
            desc(DailyEntry.date),
            desc(DailyEntry.created_at),
        )
    )

    return result.scalars().all()


# -----------------------------
# Leaderboard
# Everyone can view
# -----------------------------

@router.get("/leaderboard", response_model=list[LeaderboardItem])
async def leaderboard(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == Role.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot access member leaderboard.",
        )

    board = await build_leaderboard(session)

    return [
        LeaderboardItem(
            user_id=item["user_id"],
            username=item["username"],
            score=item["score"],
            streak=item["current_streak"],
            problems_solved=item["problems_solved"],
            rank_change=item.get("rank_change", 0),
        )
        for item in board
    ]