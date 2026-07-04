from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_active_user
from app.db import get_session
from app.models import DailyEntry, User, Role
from app.schemas import (
    AnalyticsResponse,
    LeaderboardItem,
    SimpleReportResponse,
)

router = APIRouter()


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    yesterday = datetime.utcnow().date() - timedelta(days=1)

    stmt = select(DailyEntry).where(DailyEntry.date >= yesterday)

    # Member -> only own data
    if current_user.role != Role.admin:
        stmt = stmt.where(DailyEntry.user_id == current_user.id)

    result = await session.execute(stmt)
    entries = result.scalars().all()

    problems_solved = len(entries)

    total_time = sum(e.time_taken for e in entries)

    average_time = (
        total_time / problems_solved
        if problems_solved
        else 0
    )

    difficulty_distribution = Counter(
        e.difficulty.value for e in entries
    )

    pattern_distribution = Counter(
        e.pattern.value for e in entries
    )

    members_active = len(
        set(e.user_id for e in entries)
    )

    if current_user.role == Role.admin:

        users = (
            await session.execute(
                select(User)
            )
        ).scalars().all()

        username_map = {
            u.id: u.username
            for u in users
        }

        members_missed = len(users) - members_active

        solved_counter = Counter(
            e.user_id for e in entries
        )

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

    result = await session.execute(
        select(User)
    )

    users = result.scalars().all()

    leaderboard = []

    for user in users:

        entries = (
            await session.execute(
                select(DailyEntry).where(
                    DailyEntry.user_id == user.id,
                    DailyEntry.approved == True,
                )
            )
        ).scalars().all()

        problems = len(entries)

        total_score = sum(e.score for e in entries)

        total_time = sum(e.time_taken for e in entries)

        leaderboard.append(
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "college": user.college,
                "score": total_score,
                "problems_solved": problems,
                "total_time": total_time,
                "role": user.role,
            }
        )

    leaderboard.sort(
        key=lambda x: (
            x["score"],
            x["problems_solved"],
        ),
        reverse=True,
    )

    for index, member in enumerate(leaderboard):
        member["rank"] = index + 1

    return leaderboard


async def build_report(
    current_user: User,
    session: AsyncSession,
    days: int,
    period: str,
):

    start = datetime.utcnow().date() - timedelta(days=days)

    stmt = select(DailyEntry).where(
        DailyEntry.date >= start
    )

    if current_user.role != Role.admin:
        stmt = stmt.where(
            DailyEntry.user_id == current_user.id
        )

    entries = (
        await session.execute(stmt)
    ).scalars().all()

    leaderboard = []

    if current_user.role == Role.admin:

        counts = Counter(
            e.user_id for e in entries
        )

        users = (
            await session.execute(select(User))
        ).scalars().all()

        user_map = {
            u.id: u.username
            for u in users
        }

        for uid, solved in counts.items():

            leaderboard.append(
                LeaderboardItem(
                    user_id=uid,
                    username=user_map[uid],
                    score=0,
                    streak=0,
                    problems_solved=solved,
                    rank_change=0,
                )
            )

    else:

        leaderboard.append(
            LeaderboardItem(
                user_id=current_user.id,
                username=current_user.username,
                score=sum(e.score for e in entries),
                streak=0,
                problems_solved=len(entries),
                rank_change=0,
            )
        )

    return SimpleReportResponse(
        period=period,
        total_problems=len(entries),
        average_problems=len(entries) / days,
        average_score=sum(e.score for e in entries) / days
        if entries
        else 0,
        leaderboard=leaderboard,
        most_active=current_user.username,
        most_consistent="-",
        most_missed_days="-",
        pattern_analysis=dict(
            Counter(e.pattern.value for e in entries)
        ),
        difficulty_analysis=dict(
            Counter(e.difficulty.value for e in entries)
        ),
    )