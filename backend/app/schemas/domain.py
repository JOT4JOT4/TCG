from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.card import CardType
from app.models.match import MatchStatus


class PlayerCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=3, max_length=255)


class PlayerRead(PlayerCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    card_type: CardType
    description: str = ""
    cost: int = Field(default=0, ge=0)
    attack: int = Field(default=0, ge=0)
    health: int = Field(default=0, ge=0)


class CardRead(CardCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class DeckCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    owner_id: int


class DeckRead(DeckCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class DeckCardCreate(BaseModel):
    card_id: int
    quantity: int = Field(default=1, ge=1, le=4)


class DeckCardRead(DeckCardCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    deck_id: int


class MatchCreate(BaseModel):
    player_ids: list[int] = Field(min_length=1, max_length=2)
    deck_ids: list[int] = Field(min_length=1, max_length=2)


class MatchRead(BaseModel):
    id: int
    status: MatchStatus
    winner_id: int | None