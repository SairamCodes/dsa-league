from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    get_current_active_user,
    get_current_admin_user,
)
from app.db import get_session
from app.models import DailyEntry, User
from app.schemas import UserList, UserProfile

router = APIRouter()


async def build_profile(
    session: AsyncSession,
    user: User,
):

    result = await session.execute(
        select(DailyEntry).where(
            DailyEntry.user_id == user.id
        )
    )

    entries = result.scalars().all()

    total = len(entries)

    easy = sum(
        1 for e in entries
        if e.difficulty.value == "Easy"
    )

    medium = sum(
        1 for e in entries
        if e.difficulty.value == "Medium"
    )

    hard = sum(
        1 for e in entries
        if e.difficulty.value == "Hard"
    )

    score = sum(
        e.score
        for e in entries
    )

    average = (
        sum(e.time_taken for e in entries) / total
        if total
        else 0
    )

    patterns = Counter(
        e.pattern.value
        for e in entries
    )

    favorite = (
        max(patterns, key=patterns.get)
        if patterns
        else None
    )

    weakest = (
        min(patterns, key=patterns.get)
        if patterns
        else None
    )

    return UserProfile(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        college=user.college,
        email=user.email,
        role=user.role,
        profile_picture=user.profile_picture,
        created_at=user.created_at,

        current_rank=1,
        overall_rank=1,

        current_score=score,
        weekly_score=score,
        monthly_score=score,

        total_problems=total,

        easy_count=easy,
        medium_count=medium,
        hard_count=hard,

        current_streak=user.current_streak,
        longest_streak=user.longest_streak,

        average_time=float(average),

        favorite_pattern=favorite,
        weakest_pattern=weakest,
        strongest_pattern=favorite,
    )


# ----------------------------
# Logged in user profile
# ----------------------------

@router.get(
    "/me",
    response_model=UserProfile,
)
async def my_profile(
    current_user: User = Depends(
        get_current_active_user
    ),
    session: AsyncSession = Depends(
        get_session
    ),
):
    return await build_profile(
        session,
        current_user,
    )


# ----------------------------
# Admin only
# ----------------------------

@router.get(
    "/members",
    response_model=list[UserList],
)
async def all_members(
    current_user: User = Depends(
        get_current_admin_user
    ),
    session: AsyncSession = Depends(
        get_session
    ),
):

    result = await session.execute(
        select(User).order_by(
            User.username
        )
    )

    return result.scalars().all()


# ----------------------------
# Update own profile
# ----------------------------

@router.put(
    "/me",
    response_model=UserList,
)
async def update_profile(
    payload: UserList,
    current_user: User = Depends(
        get_current_active_user
    ),
    session: AsyncSession = Depends(
        get_session
    ),
):

    current_user.full_name = payload.full_name
    current_user.college = payload.college
    current_user.email = payload.email

    await session.commit()

    await session.refresh(
        current_user
    )

    return UserList.model_validate(
        current_user
    )