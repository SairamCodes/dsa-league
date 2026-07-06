from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
)
from app.db import get_session
from app.models import OTP, Role, User
from app.schemas import (
    AuthRequest,
    AuthResponse,
    EmailRequest,
    OTPVerifyRequest,
    PasswordResetRequest,
    UserCreate,
    UserList,
)
import random
import os
import smtplib
from email.message import EmailMessage
from app.utils.avatar import default_avatar

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
        role=Role.member,
        profile_picture=payload.profile_picture or default_avatar(payload.username or payload.email),
        hashed_password=await get_password_hash(payload.password),
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return UserList.model_validate(user)


@router.post("/forgot-password")
async def forgot_password(payload: EmailRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    if not user:
        return {"message": "If that email exists, an OTP will be sent."}

    code = f"{random.randint(0,9999):04d}"
    expires = datetime.utcnow() + timedelta(minutes=5)

    old_otps = await session.execute(
        select(OTP).where(
            OTP.user_id == user.id,
            OTP.used == False,
        )
    )
    for old in old_otps.scalars().all():
        old.used = True

    otp = OTP(user_id=user.id, code=code, expires_at=expires)
    session.add(otp)
    await session.commit()

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not all([smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
        )

    subject = "DSA League Password Reset OTP"
    body = (
        f"Hello {user.full_name},\n\n"
        f"Your password reset code is: {code}\n"
        "It expires in 5 minutes.\n\n"
        "If you did not request this, please ignore this email."
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_from
    msg["To"] = user.email
    msg.set_content(body)

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as smtp:
                smtp.login(smtp_user, smtp_pass)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(smtp_user, smtp_pass)
                smtp.send_message(msg)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send reset email. Check email provider settings.",
        ) from exc

    return {"message": "If that email exists, an OTP will be sent."}


@router.post("/verify-otp")
async def verify_otp(payload: OTPVerifyRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    if not user:
        return {"valid": False}

    result = await session.execute(
        select(OTP).where(
            OTP.user_id == user.id,
            OTP.code == payload.code,
            OTP.used == False,
        )
    )
    otp = result.scalars().first()
    if not otp:
        return {"valid": False, "reason": "invalid"}

    if otp.expires_at < datetime.utcnow():
        return {"valid": False, "reason": "expired"}

    return {"valid": True}


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetRequest,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    if not user:
        return {"success": False, "message": "Invalid OTP or email"}

    result = await session.execute(
        select(OTP).where(
            OTP.user_id == user.id,
            OTP.code == payload.code,
            OTP.used == False,
        )
    )
    otp = result.scalars().first()
    if not otp:
        return {"success": False, "message": "Invalid OTP"}

    if otp.expires_at < datetime.utcnow():
        return {"success": False, "message": "OTP expired"}

    user.hashed_password = await get_password_hash(payload.new_password)
    otp.used = True
    await session.commit()

    return {"success": True, "message": "Password updated successfully"}
