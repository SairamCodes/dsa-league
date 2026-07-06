from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_active_user, get_current_admin_user
from app.db import get_session
from app.models import DailyEntry, Role, User
from app.schemas import (
    AnalyticsResponse,
    LeaderboardItem,
    SimpleReportResponse,
)
from app.utils.statistics import build_admin_overview, build_leaderboard, get_all_member_entries

router = APIRouter()


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    yesterday = datetime.utcnow().date() - timedelta(days=1)

    if current_user.role == Role.admin:
        users = (
            await session.execute(select(User).where(User.role == Role.member))
        ).scalars().all()
        member_ids = [u.id for u in users]
        stmt = select(DailyEntry).where(
            DailyEntry.date >= yesterday,
            DailyEntry.user_id.in_(member_ids),
        )
    else:
        stmt = select(DailyEntry).where(
            DailyEntry.date >= yesterday,
            DailyEntry.user_id == current_user.id,
        )

    result = await session.execute(stmt)
    entries = result.scalars().all()

    problems_solved = len(entries)
    total_time = sum(e.time_taken for e in entries)
    average_time = total_time / problems_solved if problems_solved else 0

    difficulty_distribution = Counter(e.difficulty.value for e in entries)
    pattern_distribution = Counter(e.pattern.value for e in entries)
    members_active = len(set(e.user_id for e in entries))

    if current_user.role == Role.admin:
        username_map = {u.id: u.username for u in users}
        members_missed = len(users) - members_active
        solved_counter = Counter(e.user_id for e in entries)
        if solved_counter:
            top_id = solved_counter.most_common(1)[0][0]
            weak_id = solved_counter.most_common()[-1][0]
            top_performer = username_map[top_id]
            weakest_member = username_map[weak_id]
        else:
            top_performer = "-"
            weakest_member = "-"
    else:
        members_missed = 0
        top_performer = current_user.username
        weakest_member = current_user.username

    return AnalyticsResponse(
        problems_solved=problems_solved,
        total_time=total_time,
        average_time=float(average_time),
        difficulty_distribution=dict(
            difficulty_distribution
        ),
        pattern_distribution=dict(
            pattern_distribution
        ),
        members_active=members_active,
        members_missed=members_missed,
        top_performer=top_performer,
        most_improved=top_performer,
        weakest_member=weakest_member,
        strongest_member=top_performer,
    )


@router.get("/weekly", response_model=SimpleReportResponse)
async def weekly(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    return await build_report(
        current_user,
        session,
        7,
        "Weekly",
    )


@router.get("/monthly", response_model=SimpleReportResponse)
async def monthly(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    return await build_report(
        current_user,
        session,
        30,
        "Monthly",
    )
@router.get("/leaderboard")
async def leaderboard(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role == Role.admin:
        raise HTTPException(
            status_code=403,
            detail="Admins cannot access member leaderboard.",
        )

    return await build_leaderboard(session)


@router.get("/admin/overview")
async def admin_overview(
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_session),
):
    return await build_admin_overview(session)


async def build_report(
    current_user: User,
    session: AsyncSession,
    days: int,
    period: str,
):

    start = datetime.utcnow().date() - timedelta(days=days)
    board = await build_leaderboard(session, start_date=start)

    total_problems = sum(item["problems_solved"] for item in board)
    total_score = sum(item["score"] for item in board)

    return SimpleReportResponse(
        period=period,
        total_problems=total_problems,
        average_problems=total_problems / days if days else 0,
        average_score=total_score / days if days else 0,
        leaderboard=[
            LeaderboardItem(
                user_id=item["user_id"],
                username=item["username"],
                score=item["score"],
                streak=item["current_streak"],
                problems_solved=item["problems_solved"],
                rank_change=item.get("rank_change", 0),
            )
            for item in board
        ],
        most_active=board[0]["username"] if board else "-",
        most_consistent="-",
        most_missed_days="-",
        pattern_analysis={},
        difficulty_analysis={},
    )