from enum import StrEnum

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class MatchStatus(StrEnum):
    WAITING = "waiting"
    ACTIVE = "active"
    FINISHED = "finished"


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[MatchStatus] = mapped_column(Enum(MatchStatus), default=MatchStatus.WAITING)
    winner_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True)

    players = relationship("MatchPlayer", back_populates="match", cascade="all, delete-orphan")


class MatchPlayer(Base):
    __tablename__ = "match_players"

    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"))

    match = relationship("Match", back_populates="players")