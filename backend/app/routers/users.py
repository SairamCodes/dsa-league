from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    get_current_active_user,
    get_current_admin_user,
)
from app.db import get_session
from app.models import Achievement, Role, User
from app.schemas import AchievementResponse, UserList, UserProfile
from app.utils.statistics import build_user_profile

router = APIRouter()


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
    return await build_user_profile(
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
        select(User).where(User.role == Role.member).order_by(
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
    # allow updating profile picture
    if getattr(payload, 'profile_picture', None) is not None:
        current_user.profile_picture = payload.profile_picture

    await session.commit()

    await session.refresh(
        current_user
    )

    return UserList.model_validate(
        current_user
    )


@router.put("/me/avatar", response_model=UserList)
async def update_avatar(
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    pic = payload.get("profile_picture")
    if not pic:
        return UserList.model_validate(current_user)
    current_user.profile_picture = pic
    await session.commit()
    await session.refresh(current_user)
    return UserList.model_validate(current_user)


@router.get(
    "/me/achievements",
    response_model=list[AchievementResponse],
)
async def my_achievements(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Achievement)
        .where(Achievement.user_id == current_user.id)
        .order_by(Achievement.awarded_at.desc())
    )
    return result.scalars().all()


@router.get("/colleges")
async def list_colleges(
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User.college))
    colleges = sorted({c for (c,) in result.fetchall() if c})
    return colleges