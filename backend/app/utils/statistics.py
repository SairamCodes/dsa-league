from collections import Counter
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Achievement, DailyEntry, Role, User


async def get_member_users(session: AsyncSession) -> list[User]:
    result = await session.execute(
        select(User).where(User.role == Role.member).order_by(User.username)
    )
    return list(result.scalars().all())


async def get_all_member_entries(session: AsyncSession, start_date: date | None = None) -> list[DailyEntry]:
    users = await get_member_users(session)
    member_ids = [u.id for u in users]
    if not member_ids:
        return []
    stmt = select(DailyEntry).where(DailyEntry.user_id.in_(member_ids))
    if start_date is not None:
        stmt = stmt.where(DailyEntry.date >= start_date)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_user_entries(session: AsyncSession, user_id: int, start_date: date | None = None) -> list[DailyEntry]:
    stmt = select(DailyEntry).where(DailyEntry.user_id == user_id)
    if start_date is not None:
        stmt = stmt.where(DailyEntry.date >= start_date)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def count_user_achievements(session: AsyncSession, user_id: int) -> int:
    result = await session.execute(
        select(func.count()).select_from(Achievement).where(Achievement.user_id == user_id)
    )
    return result.scalar_one()


def aggregate_entries(entries: list[DailyEntry]) -> dict[int, dict[str, int]]:
    grouped: dict[int, dict[str, int]] = {}
    for entry in entries:
        stats = grouped.setdefault(entry.user_id, {"problems_solved": 0, "score": 0})
        stats["problems_solved"] += 1
        stats["score"] += entry.score
    return grouped


async def build_leaderboard(session: AsyncSession, start_date: date | None = None) -> list[dict]:
    users = await get_member_users(session)
    if not users:
        return []

    member_ids = [u.id for u in users]
    stmt = select(DailyEntry).where(DailyEntry.user_id.in_(member_ids))
    if start_date is not None:
        stmt = stmt.where(DailyEntry.date >= start_date)

    result = await session.execute(stmt)
    entries = list(result.scalars().all())
    grouped = aggregate_entries(entries)

    leaderboard = []
    for user in users:
        totals = grouped.get(user.id, {"problems_solved": 0, "score": 0})
        leaderboard.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "college": user.college,
            "profile_picture": user.profile_picture,
            "score": totals["score"],
            "streak": user.current_streak or 0,
            "problems_solved": totals["problems_solved"],
            "rank_change": 0,
            "current_streak": user.current_streak or 0,
            "longest_streak": user.longest_streak or 0,
            "total_badges": await count_user_achievements(session, user.id),
        })

    leaderboard.sort(
        key=lambda item: (item["score"], item["problems_solved"], item["current_streak"], item["longest_streak"]),
        reverse=True,
    )
    for index, item in enumerate(leaderboard):
        item["rank"] = index + 1

    return leaderboard


async def build_user_profile(session: AsyncSession, user: User) -> dict:
    entries = await get_user_entries(session, user.id)
    total_score = sum(e.score for e in entries)
    total_problems = len(entries)
    today = datetime.utcnow().date()
    weekly_cutoff = today - timedelta(days=7)
    monthly_cutoff = today - timedelta(days=30)

    weekly_score = sum(e.score for e in entries if e.date.date() >= weekly_cutoff)
    monthly_score = sum(e.score for e in entries if e.date.date() >= monthly_cutoff)

    time_total = sum(e.time_taken for e in entries)
    average_time = time_total / total_problems if total_problems else 0

    patterns = Counter(e.pattern.value for e in entries)
    favorite_pattern = max(patterns, key=patterns.get) if patterns else None
    weakest_pattern = min(patterns, key=patterns.get) if patterns else None

    leaderboard = await build_leaderboard(session)
    rank = next((item["rank"] for item in leaderboard if item["user_id"] == user.id), 0)

    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "college": user.college,
        "email": user.email,
        "role": user.role,
        "profile_picture": user.profile_picture,
        "created_at": user.created_at,
        "current_rank": rank,
        "overall_rank": rank,
        "current_score": total_score,
        "weekly_score": weekly_score,
        "monthly_score": monthly_score,
        "total_problems": total_problems,
        "easy_count": sum(1 for e in entries if e.difficulty.value == "Easy"),
        "medium_count": sum(1 for e in entries if e.difficulty.value == "Medium"),
        "hard_count": sum(1 for e in entries if e.difficulty.value == "Hard"),
        "current_streak": user.current_streak or 0,
        "longest_streak": user.longest_streak or 0,
        "average_time": float(average_time),
        "favorite_pattern": favorite_pattern,
        "weakest_pattern": weakest_pattern,
        "strongest_pattern": favorite_pattern,
    }


async def build_admin_overview(session: AsyncSession) -> dict:
    users = await get_member_users(session)
    member_ids = [u.id for u in users]
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    all_entries: list[DailyEntry] = []
    if member_ids:
        stmt = select(DailyEntry).where(DailyEntry.user_id.in_(member_ids))
        result = await session.execute(stmt)
        all_entries = list(result.scalars().all())

    total_problems = len(all_entries)
    total_score = sum(e.score for e in all_entries)

    today_entries = [e for e in all_entries if e.date.date() == today]
    week_entries = [e for e in all_entries if e.date.date() >= week_ago]
    month_entries = [e for e in all_entries if e.date.date() >= month_ago]

    active_users_today = len({e.user_id for e in today_entries})
    new_registrations_today = len([u for u in users if u.created_at and u.created_at.date() == today])

    leaderboard = await build_leaderboard(session) if member_ids else []
    highest_score = leaderboard[0]["score"] if leaderboard else 0

    highest_current_streak = max((u.current_streak or 0) for u in users) if users else 0
    highest_longest_streak = max((u.longest_streak or 0) for u in users) if users else 0
    total_colleges = len({u.college for u in users if u.college})

    total_achievements = 0
    if member_ids:
        ach_result = await session.execute(
            select(func.count()).select_from(Achievement).where(Achievement.user_id.in_(member_ids))
        )
        total_achievements = ach_result.scalar_one()

    grouped = aggregate_entries(all_entries)
    user_map = {u.id: u for u in users}

    most_active = "-"
    highest_ranked = "-"
    most_consistent = "-"
    fastest_growing = "-"
    highest_score_today_user = "-"
    highest_score_today_val = 0

    if leaderboard:
        most_active = leaderboard[0].get("username", "-")
        highest_ranked = leaderboard[0].get("username", "-")

    if users:
        consistent_user = max(users, key=lambda u: u.current_streak or 0)
        most_consistent = consistent_user.username if (consistent_user.current_streak or 0) > 0 else "-"

        weekly_grouped = aggregate_entries(week_entries)
        if weekly_grouped:
            fastest_id = max(weekly_grouped, key=lambda uid: weekly_grouped[uid]["problems_solved"])
            fastest_growing = user_map.get(fastest_id, type("", (), {"username": "-"})).username

    today_grouped = aggregate_entries(today_entries)
    if today_grouped:
        top_today_id = max(today_grouped, key=lambda uid: today_grouped[uid]["score"])
        highest_score_today_user = user_map.get(top_today_id, type("", (), {"username": "-"})).username
        highest_score_today_val = today_grouped[top_today_id]["score"]

    college_scores: dict[str, int] = {}
    for e in all_entries:
        u = user_map.get(e.user_id)
        if u and u.college:
            college_scores[u.college] = college_scores.get(u.college, 0) + e.score
    top_college = max(college_scores, key=college_scores.get) if college_scores else "-"

    pattern_dist = dict(Counter(e.pattern.value for e in all_entries))
    difficulty_dist = dict(Counter(e.difficulty.value for e in all_entries))
    most_solved_pattern = max(pattern_dist, key=pattern_dist.get) if pattern_dist else "-"
    most_solved_difficulty = max(difficulty_dist, key=difficulty_dist.get) if difficulty_dist else "-"

    college_dist: dict[str, int] = {}
    for u in users:
        if u.college:
            college_dist[u.college] = college_dist.get(u.college, 0) + 1

    daily_submissions: dict[str, int] = {}
    for e in month_entries:
        day_str = e.date.date().isoformat()
        daily_submissions[day_str] = daily_submissions.get(day_str, 0) + 1

    registration_trend: dict[str, int] = {}
    for u in users:
        if u.created_at and u.created_at.date() >= month_ago:
            day_str = u.created_at.date().isoformat()
            registration_trend[day_str] = registration_trend.get(day_str, 0) + 1

    sorted_by_reg = sorted(users, key=lambda u: u.created_at or datetime.min, reverse=True)
    recent_registrations = [
        {"id": u.id, "username": u.username, "full_name": u.full_name, "college": u.college,
         "created_at": u.created_at.isoformat() if u.created_at else None}
        for u in sorted_by_reg[:5]
    ]

    seen_active: set[int] = set()
    recent_active: list[dict] = []
    for e in sorted(all_entries, key=lambda x: x.date, reverse=True):
        if e.user_id not in seen_active:
            seen_active.add(e.user_id)
            u = user_map.get(e.user_id)
            if u:
                recent_active.append({"id": u.id, "username": u.username, "full_name": u.full_name, "last_active": e.date.isoformat()})
            if len(recent_active) >= 5:
                break

    active_week_ids = {e.user_id for e in week_entries}
    inactive_members = [
        {"id": u.id, "username": u.username, "full_name": u.full_name, "college": u.college}
        for u in users if u.id not in active_week_ids
    ]

    return {
        "total_members": len(users),
        "total_problems": total_problems,
        "total_score": total_score,
        "active_users_today": active_users_today,
        "new_registrations_today": new_registrations_today,
        "highest_score": highest_score,
        "highest_current_streak": highest_current_streak,
        "highest_longest_streak": highest_longest_streak,
        "highest_streak": highest_longest_streak,
        "total_colleges": total_colleges,
        "total_achievements": total_achievements,
        "most_active_member": most_active,
        "highest_ranked_member": highest_ranked,
        "most_consistent_member": most_consistent,
        "fastest_growing_member": fastest_growing,
        "highest_score_today_user": highest_score_today_user,
        "highest_score_today_val": highest_score_today_val,
        "today_submissions": len(today_entries),
        "weekly_submissions": len(week_entries),
        "monthly_submissions": len(month_entries),
        "top_college": top_college,
        "most_solved_pattern": most_solved_pattern,
        "most_solved_difficulty": most_solved_difficulty,
        "pattern_distribution": pattern_dist,
        "difficulty_distribution": difficulty_dist,
        "college_distribution": college_dist,
        "daily_submissions_chart": daily_submissions,
        "registration_trend": registration_trend,
        "recent_registrations": recent_registrations,
        "recent_active": recent_active,
        "inactive_members": inactive_members,
    }


async def build_admin_member_rows(session: AsyncSession) -> list[dict]:
    users = await get_member_users(session)
    if not users:
        return []

    member_ids = [u.id for u in users]
    stmt = select(DailyEntry).where(DailyEntry.user_id.in_(member_ids))
    result = await session.execute(stmt)
    entries = list(result.scalars().all())
    grouped = aggregate_entries(entries)

    rows = []
    for user in users:
        totals = grouped.get(user.id, {"problems_solved": 0, "score": 0})
        rows.append({
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "college": user.college,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "created_at": user.created_at,
            "total_problems": totals["problems_solved"],
            "total_score": totals["score"],
            "current_streak": user.current_streak or 0,
            "longest_streak": user.longest_streak or 0,
        })

    return rows
