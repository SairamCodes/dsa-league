from typing import Any


def calculate_score(entry: Any, count_by_day: int) -> int:
    """Calculate score for a submission.

    Kept as a standalone utility so all parts of the backend use a
    single source of truth for score computation.
    """
    score = 0

    base = {
        "Easy": 5,
        "Medium": 10,
        "Hard": 20,
    }

    # entry.difficulty may be an Enum or string; use value if present
    difficulty = getattr(entry, "difficulty", None)
    diff_val = getattr(difficulty, "value", difficulty)
    score += base.get(diff_val, 0)

    if getattr(entry, "without_solution", False):
        score += 5

    time_taken = getattr(entry, "time_taken", 0)
    if time_taken <= 20:
        score += 5
    elif time_taken <= 40:
        score += 3
    elif time_taken <= 60:
        score += 1

    if getattr(entry, "revision", False):
        score += 2

    if count_by_day >= 3:
        score += 10

    if count_by_day >= 5:
        score += 10

    if count_by_day >= 10:
        score += 25

    if diff_val == "Hard":
        score += 10

    return score
