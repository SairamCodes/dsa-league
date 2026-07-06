from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl, ConfigDict

from app.models import (
    Role,
    Difficulty,
    Platform,
    Pattern,
    AchievementType,
    NotificationType,
)


# ---------------- TOKEN ---------------- #

class TokenPayload(BaseModel):
    sub: int
    exp: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------- USERS ---------------- #

class UserBase(BaseModel):
    username: str
    full_name: str
    college: Optional[str] = None
    email: EmailStr


class UserCreate(UserBase):
    password: str
    profile_picture: Optional[str] = None


class AdminUserCreate(UserBase):
    role: Role
    password: str
    profile_picture: Optional[str] = None


class UserList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    college: Optional[str]
    email: EmailStr
    role: Role
    profile_picture: Optional[str]
    created_at: datetime


class AdminMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    college: Optional[str]
    email: EmailStr
    profile_picture: Optional[str]
    created_at: datetime
    total_problems: int
    total_score: int
    current_streak: int
    longest_streak: int


class UserProfile(UserList):
    current_rank: int
    overall_rank: int

    current_score: int
    weekly_score: int
    monthly_score: int

    total_problems: int

    easy_count: int
    medium_count: int
    hard_count: int

    current_streak: int
    longest_streak: int

    average_time: float

    favorite_pattern: Optional[Pattern]
    weakest_pattern: Optional[Pattern]
    strongest_pattern: Optional[Pattern]


# ---------------- AUTH ---------------- #

class AuthRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False


class AuthResponse(TokenResponse):
    user: UserList


class EmailRequest(BaseModel):
    email: EmailStr


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class PasswordResetRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


# ---------------- DAILY ENTRIES ---------------- #

class DailyEntryCreate(BaseModel):
    platform: Platform
    problem_number: str
    problem_name: str
    problem_link: HttpUrl

    pattern: Pattern
    difficulty: Difficulty

    time_taken: int

    solved: bool
    without_solution: bool
    revision: bool

    notes: Optional[str] = None


class DailyEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: datetime

    platform: Platform
    problem_number: str
    problem_name: str
    problem_link: HttpUrl

    pattern: Pattern
    difficulty: Difficulty

    time_taken: int

    solved: bool
    without_solution: bool
    revision: bool

    notes: Optional[str]

    score: int
    approved: bool


# ---------------- ACHIEVEMENTS ---------------- #

class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: AchievementType
    awarded_at: datetime


# ---------------- NOTIFICATIONS ---------------- #

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: NotificationType
    title: str
    message: str

    read: bool
    created_at: datetime


# ---------------- LEADERBOARD ---------------- #

class LeaderboardItem(BaseModel):
    user_id: int
    username: str

    score: int
    streak: int
    problems_solved: int

    rank_change: int


# ---------------- REPORTS ---------------- #

class AnalyticsResponse(BaseModel):
    problems_solved: int
    total_time: int
    average_time: float

    difficulty_distribution: dict
    pattern_distribution: dict

    members_active: int
    members_missed: int

    top_performer: str
    most_improved: str
    weakest_member: str
    strongest_member: str


class SimpleReportResponse(BaseModel):
    period: str

    total_problems: int
    average_problems: float
    average_score: float

    leaderboard: list[LeaderboardItem]

    most_active: str
    most_consistent: str
    most_missed_days: str

    pattern_analysis: dict
    difficulty_analysis: dict