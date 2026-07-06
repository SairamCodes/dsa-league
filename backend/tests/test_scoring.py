from app.utils.scoring import calculate_score


class DummyEntry:
    def __init__(self, difficulty, without_solution=False, time_taken=30, revision=False):
        self.difficulty = type("D", (), {"value": difficulty})
        self.without_solution = without_solution
        self.time_taken = time_taken
        self.revision = revision


def test_calculate_score_basic():
    e = DummyEntry("Medium", without_solution=False, time_taken=25, revision=False)
    s = calculate_score(e, count_by_day=1)
    # base for Medium = 10, time 25 -> +3 => total 13
    assert s == 13


def test_calculate_score_bonuses():
    e = DummyEntry("Hard", without_solution=True, time_taken=10, revision=True)
    s = calculate_score(e, count_by_day=5)
    # base Hard=20 + without_solution 5 + time<=20 +5 + revision 2 + count_by_day>=3 +10 + >=5 +10 + Hard extra +10
    # total = 20+5+5+2+10+10+10 = 62
    assert s == 62
