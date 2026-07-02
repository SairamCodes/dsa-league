from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
)
from app.db import get_session
from app.models import Role, User
from app.schemas import (
    AuthRequest,
    AuthResponse,
    EmailRequest,
    UserCreate,
    UserList,
)

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: AuthRequest,
    session: AsyncSession = Depends(get_session),
):
    user = await authenticate_user(
        session,
        payload.username,
        payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = await create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(
            minutes=60 if not payload.remember_me else 60 * 24 * 7
        ),
    )

    return AuthResponse(
        access_token=access_token,
        user=UserList.model_validate(user),
    )


@router.post("/register", response_model=UserList)
async def register(
    payload: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    existing = await session.execute(
        select(User).where(
            (User.username == payload.username)
            | (User.email == payload.email)
        )
    )

    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists",
        )

    user = User(
        username=payload.username,
        full_name=payload.full_name,
        college=payload.college,
        email=payload.email,

        # Every website registration becomes MEMBER
        role=Role.member,

        # Profile picture can be added later from Profile page
        profile_picture=None,

        hashed_password=await get_password_hash(
            payload.password
        ),
    )

    session.add(user)

    await session.commit()

    await session.refresh(user)

    return UserList.model_validate(user)


@router.post("/forgot-password")
async def forgot_password(
    payload: EmailRequest,
):
    return {
        "message": "If that email exists, a password reset link would be sent."
    }