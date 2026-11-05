from dataclasses import dataclass, field
from random import choice, shuffle

from app.models.match import RoundResult
from app.services.combat import resolve_combat

STARTING_HAND_SIZE = 5
STARTING_LIFE = 3


@dataclass(frozen=True)
class GameCard:
    id: int
    name: str
    card_type: str
    power: int
    description: str
    image_url: str | None = None

    def as_dict(self) -> dict[str, int | str | None]:
        return {
            "id": self.id,
            "name": self.name,
            "card_type": self.card_type,
            "power": self.power,
            "description": self.description,
            "image_url": self.image_url,
        }


@dataclass
class Combatant:
    deck: list[GameCard]
    hand: list[GameCard]
    graveyard: list[GameCard] = field(default_factory=list)
    life: int = STARTING_LIFE


@dataclass
class Game:
    player: Combatant
    rival: Combatant
    player_field: GameCard | None = None
    rival_field: GameCard | None = None
    round: int = 1
    phase: str = "selecting"
    result: RoundResult | None = None
    winner: str | None = None


def _new_combatant(cards: list[GameCard]) -> Combatant:
    shuffled_cards = cards.copy()
    shuffle(shuffled_cards)
    return Combatant(deck=shuffled_cards[STARTING_HAND_SIZE:], hand=shuffled_cards[:STARTING_HAND_SIZE])


def create_game(player_cards: list[GameCard], rival_cards: list[GameCard]) -> Game:
    if len(player_cards) < STARTING_HAND_SIZE or len(rival_cards) < STARTING_HAND_SIZE:
        raise ValueError("Both decks must contain at least five cards")
    return Game(player=_new_combatant(player_cards), rival=_new_combatant(rival_cards))


def _card_list(cards: list[GameCard]) -> list[dict[str, int | str | None]]:
    return [card.as_dict() for card in cards]


def _draw_next_card(combatant: Combatant) -> None:
    if not combatant.deck and not combatant.hand and combatant.graveyard:
        combatant.deck = combatant.graveyard.copy()
        combatant.graveyard.clear()
        shuffle(combatant.deck)
    if combatant.deck:
        combatant.hand.append(combatant.deck.pop(0))


def serialize_game(game: Game, reveal: bool = False) -> dict:
    return {
        "round": game.round,
        "phase": game.phase,
        "result": game.result,
        "winner": game.winner,
        "player": {
            "hand": _card_list(game.player.hand),
            "deck_count": len(game.player.deck),
            "graveyard": _card_list(game.player.graveyard),
            "life": game.player.life,
        },
        "rival": {
            "hand_count": len(game.rival.hand),
            "deck_count": len(game.rival.deck),
            "graveyard_count": len(game.rival.graveyard),
            "life": game.rival.life,
        },
        "fields": {
            "player": game.player_field.as_dict() if reveal and game.player_field else None,
            "rival": game.rival_field.as_dict() if reveal and game.rival_field else None,
        },
    }


def choose_player_card(game: Game, card_id: int) -> None:
    if game.phase != "selecting":
        raise ValueError("A card cannot be selected in the current phase")
    selected = next((card for card in game.player.hand if card.id == card_id), None)
    if selected is None:
        raise ValueError("The selected card is not in the player's hand")

    game.player.hand.remove(selected)
    shuffle(game.player.hand)
    game.player_field = selected
    if not game.rival.hand:
        raise ValueError("The rival has no cards available")
    game.rival_field = choice(game.rival.hand)
    game.rival.hand.remove(game.rival_field)
    game.phase = "ready"


def reveal_game(game: Game) -> None:
    if game.phase != "ready":
        raise ValueError("Both players must select a card before revealing")
    assert game.player_field is not None
    assert game.rival_field is not None
    game.result = resolve_combat(
        game.player_field.card_type,
        game.player_field.power,
        game.rival_field.card_type,
        game.rival_field.power,
    )
    game.phase = "revealed"


def resolve_game_round(game: Game) -> None:
    if game.phase != "revealed":
        raise ValueError("The cards must be revealed before resolving the round")
    assert game.player_field is not None
    assert game.rival_field is not None
    if game.result == RoundResult.PLAYER_ONE:
        game.rival.life = max(0, game.rival.life - 1)
    elif game.result == RoundResult.PLAYER_TWO:
        game.player.life = max(0, game.player.life - 1)
    game.player.graveyard.append(game.player_field)
    game.rival.graveyard.append(game.rival_field)

    if game.player.life == 0 or game.rival.life == 0:
        game.winner = "draw" if game.player.life == 0 and game.rival.life == 0 else (
            "player" if game.rival.life == 0 else "rival"
        )
        game.phase = "finished"
        return

    _draw_next_card(game.player)
    _draw_next_card(game.rival)
    game.player_field = None
    game.rival_field = None
    game.result = None
    game.round += 1
    game.phase = "selecting"
