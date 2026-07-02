from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import Role, User

SECRET_KEY = "dsa_league_secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


async def get_user_by_username(
    session: AsyncSession,
    username: str,
):
    result = await session.execute(
        select(User).where(
            User.username == username
        )
    )
    return result.scalars().first()


async def verify_password(
    plain_password: str,
    hashed_password: str,
):
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


async def get_password_hash(
    password: str,
):
    return pwd_context.hash(password)


async def authenticate_user(
    session: AsyncSession,
    username: str,
    password: str,
):
    user = await get_user_by_username(
        session,
        username,
    )

    if not user:
        return None

    if not await verify_password(
        password,
        user.hashed_password,
    ):
        return None

    return user


async def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update(
        {
            "exp": expire
        }
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = int(payload.get("sub"))

    except (JWTError, TypeError, ValueError):
        raise credentials_exception

    result = await session.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(
        get_current_user
    ),
):
    if current_user.role != Role.admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required",
        )

    return current_user