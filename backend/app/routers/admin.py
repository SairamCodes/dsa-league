from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    get_current_admin_user,
    get_password_hash,
)
from app.db import get_session
from app.models import Role, User, DailyEntry
from app.schemas import UserList

router = APIRouter()

@router.get("/members", response_model=list[UserList])
async def get_members(current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User))
    return result.scalars().all()

@router.post("/members", response_model=UserList)
async def add_member(payload: UserList, current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    existing = await session.execute(select(User).where((User.username == payload.username) | (User.email == payload.email)))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Member already exists")
    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        college=payload.college,
        role=payload.role,
        profile_picture=payload.profile_picture,
        hashed_password=await get_password_hash("Password123!"),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return UserList.from_orm(user)
@router.delete("/members/{user_id}")
async def delete_member(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_session),
):

    result = await session.execute(
        select(User).where(User.id == user_id)
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    from app.models import Role

    if user.role == Role.admin:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete admin account",
        )

    await session.execute(
        delete(DailyEntry).where(
            DailyEntry.user_id == user.id
        )
    )

    await session.delete(user)

    await session.commit()

    return {
        "message": "User deleted successfully"
    }


@router.put("/members/{member_id}", response_model=UserList)
async def edit_member(member_id: int, payload: UserList, current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.id == member_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")
    user.full_name = payload.full_name
    user.college = payload.college
    user.email = payload.email
    user.profile_picture = payload.profile_picture
    user.role = payload.role
    await session.commit()
    await session.refresh(user)
    return UserList.from_orm(user)

@router.put("/members/{member_id}/reset-password")
async def reset_password(member_id: int, current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.id == member_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")
    user.hashed_password = await get_password_hash("Password123!")
    await session.commit()
    return {"message": "Password reset to default"}

@router.get("/entries/pending")
async def pending_entries(current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(DailyEntry).where(DailyEntry.approved == False).order_by(DailyEntry.created_at.desc()))
    return result.scalars().all()

@router.put("/entries/{entry_id}/approve")
async def approve_entry(entry_id: int, current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(DailyEntry).where(DailyEntry.id == entry_id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.approved = True
    await session.commit()
    return {"message": "Entry approved"}

@router.put("/entries/{entry_id}/reject")
async def reject_entry(entry_id: int, current_user: User = Depends(get_current_admin_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(DailyEntry).where(DailyEntry.id == entry_id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await session.delete(entry)
    await session.commit()
    return {"message": "Entry rejected"}
