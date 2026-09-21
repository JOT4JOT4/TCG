from app.models.card import CardType
from app.models.match import RoundResult


BEATS: dict[CardType, CardType] = {
    CardType.LOGIA: CardType.PARAMECIA,
    CardType.PARAMECIA: CardType.ZOAN,
    CardType.ZOAN: CardType.LOGIA,
}


def resolve_combat(
    player_one_type: CardType,
    player_one_power: int,
    player_two_type: CardType,
    player_two_power: int,
) -> RoundResult:
    if player_one_type == player_two_type:
        if player_one_power > player_two_power:
            return RoundResult.PLAYER_ONE
        if player_two_power > player_one_power:
            return RoundResult.PLAYER_TWO
        return RoundResult.DRAW
    if BEATS[player_one_type] == player_two_type:
        return RoundResult.PLAYER_ONE
    return RoundResult.PLAYER_TWO