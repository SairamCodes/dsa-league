from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_active_user
from app.db import get_session
from app.models import DailyEntry, User
from app.schemas import (
    DailyEntryCreate,
    DailyEntryRead,
    LeaderboardItem,
)

router = APIRouter()


def calculate_score(entry: DailyEntryCreate, count_by_day: int):

    score = 0

    base = {
        "Easy": 5,
        "Medium": 10,
        "Hard": 20,
    }

    score += base[entry.difficulty.value]

    if entry.without_solution:
        score += 5

    if entry.time_taken <= 20:
        score += 5
    elif entry.time_taken <= 40:
        score += 3
    elif entry.time_taken <= 60:
        score += 1

    if entry.revision:
        score += 2

    if count_by_day >= 3:
        score += 10

    if count_by_day >= 5:
        score += 10

    if count_by_day >= 10:
        score += 25

    if entry.difficulty.value == "Hard":
        score += 10

    return score


# -----------------------------
# Submit Entry
# -----------------------------

@router.post("/submit", response_model=DailyEntryRead)
async def submit_entry(
    payload: DailyEntryCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):

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
        approved=False,
    )

    session.add(entry)

    await session.commit()

    await session.refresh(entry)

    return entry


# -----------------------------
# My Entries
# -----------------------------

@router.get("/mine", response_model=list[DailyEntryRead])
async def my_entries(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):

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

    users = (
        await session.execute(
            select(User)
        )
    ).scalars().all()

    board = []

    for user in users:

        entries = (
            await session.execute(
                select(DailyEntry).where(
                    DailyEntry.user_id == user.id
                )
            )
        ).scalars().all()

        board.append(
            LeaderboardItem(
                user_id=user.id,
                username=user.username,
                score=sum(e.score for e in entries),
                streak=0,
                problems_solved=len(entries),
                rank_change=0,
            )
        )

    board.sort(
        key=lambda x: x.score,
        reverse=True,
    )

    return board