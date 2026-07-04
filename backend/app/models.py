from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class Role(str, enum.Enum):
    admin = "admin"
    member = "member"

class Difficulty(str, enum.Enum):
    easy = "Easy"
    medium = "Medium"
    hard = "Hard"

class Platform(str, enum.Enum):
    leetcode = "LeetCode"
    geeksforgeeks = "GeeksForGeeks"
    codechef = "CodeChef"
    codeforces = "Codeforces"
    atcoder = "AtCoder"

class Pattern(str, enum.Enum):
    arrays = "Arrays"
    hashing = "Hashing"
    two_pointers = "Two Pointers"
    sliding_window = "Sliding Window"
    prefix_sum = "Prefix Sum"
    binary_search = "Binary Search"
    sorting = "Sorting"
    stack = "Stack"
    queue = "Queue"
    linked_list = "Linked List"
    recursion = "Recursion"
    backtracking = "Backtracking"
    trees = "Trees"
    bst = "BST"
    heap = "Heap"
    trie = "Trie"
    graph = "Graph"
    bfs = "BFS"
    dfs = "DFS"
    topological_sort = "Topological Sort"
    union_find = "Union Find"
    greedy = "Greedy"
    dynamic_programming = "Dynamic Programming"
    bit_manipulation = "Bit Manipulation"
    math = "Math"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(32), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    college = Column(String(128), nullable=True)
    email = Column(String(256), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    role = Column(Enum(Role), nullable=False, default=Role.member)
    profile_picture = Column(String(256), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_submission_date = Column(DateTime(timezone=True), nullable=True)
    entries = relationship("DailyEntry", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class DailyEntry(Base):
    __tablename__ = "daily_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    platform = Column(Enum(Platform), nullable=False)
    problem_number = Column(String(64), nullable=False)
    problem_name = Column(String(256), nullable=False)
    problem_link = Column(String(512), nullable=False)
    pattern = Column(Enum(Pattern), nullable=False)
    difficulty = Column(Enum(Difficulty), nullable=False)
    time_taken = Column(Integer, nullable=False)
    solved = Column(Boolean, nullable=False, default=True)
    without_solution = Column(Boolean, nullable=False, default=False)
    revision = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    score = Column(Integer, nullable=False, default=0)
    approved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="entries")

class AchievementType(str, enum.Enum):
    first_problem = "First Problem"
    ten_problems = "10 Problems"
    fifty_problems = "50 Problems"
    one_hundred_problems = "100 Problems"
    two_fifty_problems = "250 Problems"
    five_hundred_problems = "500 Problems"
    one_thousand_problems = "1000 Problems"
    seven_day_streak = "7 Day Streak"
    fifteen_day_streak = "15 Day Streak"
    thirty_day_streak = "30 Day Streak"
    one_hundred_day_streak = "100 Day Streak"
    hashing_master = "Hashing Master"
    dp_master = "DP Master"
    graph_master = "Graph Master"
    tree_master = "Tree Master"
    fast_solver = "Fast Solver"
    consistency_king = "Consistency King"
    weekend_warrior = "Weekend Warrior"
    monthly_champion = "Monthly Champion"
    weekly_champion = "Weekly Champion"

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(AchievementType), nullable=False)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="achievements")

class NotificationType(str, enum.Enum):
    daily_reminder = "Daily Reminder"
    weekly_winner = "Weekly Winner"
    monthly_winner = "Monthly Winner"
    achievement_unlocked = "Achievement Unlocked"
    rank_increased = "Rank Increased"
    rank_dropped = "Rank Dropped"
    missed_today = "Missed Today"

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="notifications")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    period = Column(String(64), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    data = Column(Text, nullable=False)
