from app.models.card import CardType
from app.models.match import RoundResult
from app.services.combat import resolve_combat


def test_type_effectiveness_wins_before_power() -> None:
    assert resolve_combat(CardType.LOGIA, 1, CardType.PARAMECIA, 9) == RoundResult.PLAYER_ONE
    assert resolve_combat(CardType.PARAMECIA, 1, CardType.ZOAN, 9) == RoundResult.PLAYER_ONE
    assert resolve_combat(CardType.ZOAN, 1, CardType.LOGIA, 9) == RoundResult.PLAYER_ONE


def test_same_type_uses_power_and_equal_power_draws() -> None:
    assert resolve_combat(CardType.LOGIA, 9, CardType.LOGIA, 1) == RoundResult.PLAYER_ONE
    assert resolve_combat(CardType.ZOAN, 2, CardType.ZOAN, 8) == RoundResult.PLAYER_TWO
    assert resolve_combat(CardType.PARAMECIA, 4, CardType.PARAMECIA, 4) == RoundResult.DRAW