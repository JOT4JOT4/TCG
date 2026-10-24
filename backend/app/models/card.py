from enum import StrEnum

from sqlalchemy import Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class CardType(StrEnum):
    LOGIA = "logia"
    PARAMECIA = "paramecia"
    ZOAN = "zoan"


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    card_type: Mapped[CardType] = mapped_column(Enum(CardType), index=True)
    power: Mapped[int] = mapped_column(Integer, default=1)
    description: Mapped[str] = mapped_column(Text, default="")