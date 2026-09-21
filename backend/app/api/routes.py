from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.card import Card
from app.models.deck import Deck, DeckCard
from app.models.match import Match, MatchPlayer
from app.models.player import Player
from app.schemas import (
    CardCreate,
    CardRead,
    DeckCardCreate,
    DeckCardRead,
    DeckCreate,
    DeckRead,
    MatchCreate,
    MatchRead,
    PlayerCreate,
    PlayerRead,
)

router = APIRouter()


@router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/players", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(payload: PlayerCreate, db: Session = Depends(get_db)) -> Player:
    player = Player(**payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/players", response_model=list[PlayerRead])
def list_players(db: Session = Depends(get_db)) -> list[Player]:
    return list(db.scalars(select(Player).order_by(Player.id)))


@router.post("/cards", response_model=CardRead, status_code=status.HTTP_201_CREATED)
def create_card(payload: CardCreate, db: Session = Depends(get_db)) -> Card:
    card = Card(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/cards", response_model=list[CardRead])
def list_cards(db: Session = Depends(get_db)) -> list[Card]:
    return list(db.scalars(select(Card).order_by(Card.id)))


@router.post("/decks", response_model=DeckRead, status_code=status.HTTP_201_CREATED)
def create_deck(payload: DeckCreate, db: Session = Depends(get_db)) -> Deck:
    if db.get(Player, payload.owner_id) is None:
        raise HTTPException(status_code=404, detail="Player not found")
    deck = Deck(**payload.model_dump())
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/decks", response_model=list[DeckRead])
def list_decks(db: Session = Depends(get_db)) -> list[Deck]:
    return list(db.scalars(select(Deck).order_by(Deck.id)))


@router.post("/decks/{deck_id}/cards", response_model=DeckCardRead, status_code=status.HTTP_201_CREATED)
def add_card_to_deck(
    deck_id: int,
    payload: DeckCardCreate,
    db: Session = Depends(get_db),
) -> DeckCard:
    if db.get(Deck, deck_id) is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    if db.get(Card, payload.card_id) is None:
        raise HTTPException(status_code=404, detail="Card not found")

    deck_card = db.scalar(
        select(DeckCard).where(DeckCard.deck_id == deck_id, DeckCard.card_id == payload.card_id)
    )
    if deck_card is None:
        deck_card = DeckCard(deck_id=deck_id, **payload.model_dump())
        db.add(deck_card)
    else:
        deck_card.quantity = payload.quantity
    db.commit()
    db.refresh(deck_card)
    return deck_card


@router.get("/decks/{deck_id}/cards", response_model=list[DeckCardRead])
def list_deck_cards(deck_id: int, db: Session = Depends(get_db)) -> list[DeckCard]:
    if db.get(Deck, deck_id) is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    return list(db.scalars(select(DeckCard).where(DeckCard.deck_id == deck_id).order_by(DeckCard.id)))


@router.post("/matches", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(payload: MatchCreate, db: Session = Depends(get_db)) -> Match:
    if len(payload.player_ids) != len(payload.deck_ids):
        raise HTTPException(status_code=400, detail="Each player needs one deck")
    if any(db.get(Player, player_id) is None for player_id in payload.player_ids):
        raise HTTPException(status_code=404, detail="Player not found")
    if any(db.get(Deck, deck_id) is None for deck_id in payload.deck_ids):
        raise HTTPException(status_code=404, detail="Deck not found")

    match = Match()
    match.players = [
        MatchPlayer(player_id=player_id, deck_id=deck_id)
        for player_id, deck_id in zip(payload.player_ids, payload.deck_ids)
    ]
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.get("/matches", response_model=list[MatchRead])
def list_matches(db: Session = Depends(get_db)) -> list[Match]:
    return list(db.scalars(select(Match).order_by(Match.id)))
