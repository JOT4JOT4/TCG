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

    def as_dict(self) -> dict[str, int | str]:
        return {
            "id": self.id,
            "name": self.name,
            "card_type": self.card_type,
            "power": self.power,
            "description": self.description,
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


CARD_LIBRARY = [
    GameCard(1, "Dragón de Brasa", "logia", 7, "Una llama que no puede tocarse."),
    GameCard(2, "Monje de la Tormenta", "paramecia", 6, "Convierte el viento en golpes precisos."),
    GameCard(3, "Lobo de Hierro", "zoan", 8, "Su armadura natural no cede."),
    GameCard(4, "Oráculo Lunar", "logia", 4, "Lee el próximo movimiento."),
    GameCard(5, "Rompemareas", "paramecia", 8, "Parte las olas con una mano."),
    GameCard(6, "Halcón del Cielo", "zoan", 5, "Ataca desde las nubes."),
    GameCard(7, "Llama de Cristal", "logia", 6, "Brilla antes de quemar."),
    GameCard(8, "Puño Gravitatorio", "paramecia", 5, "Aplasta todo a su alrededor."),
    GameCard(9, "Oso Feral", "zoan", 7, "Una fuerza imposible de detener."),
    GameCard(10, "Caminante de Bruma", "logia", 3, "Desaparece en el aire."),
    GameCard(11, "Reina de Espinas", "paramecia", 7, "Cada defensa tiene un precio."),
    GameCard(12, "Tigre del Trueno", "zoan", 6, "Su rugido anuncia la victoria."),
]


def _new_combatant(cards: list[GameCard]) -> Combatant:
    shuffled_cards = cards.copy()
    shuffle(shuffled_cards)
    return Combatant(deck=shuffled_cards[STARTING_HAND_SIZE:], hand=shuffled_cards[:STARTING_HAND_SIZE])


def create_game() -> Game:
    return Game(player=_new_combatant(CARD_LIBRARY), rival=_new_combatant(list(reversed(CARD_LIBRARY))))


def _card_list(cards: list[GameCard]) -> list[dict[str, int | str]]:
    return [card.as_dict() for card in cards]


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

    if game.player.deck:
        game.player.hand.append(game.player.deck.pop(0))
    if game.rival.deck:
        game.rival.hand.append(game.rival.deck.pop(0))
    game.player_field = None
    game.rival_field = None
    game.result = None
    game.round += 1
    game.phase = "selecting"
