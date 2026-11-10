"""Create the initial TCG schema.

Revision ID: 0001_initial_schema
Revises:
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

card_type = sa.Enum("CREATURE", "SPELL", "RESOURCE", name="cardtype")
match_status = sa.Enum("WAITING", "ACTIVE", "FINISHED", name="matchstatus")


def upgrade() -> None:
    bind = op.get_bind()
    card_type.create(bind, checkfirst=True)
    match_status.create(bind, checkfirst=True)

    op.create_table(
        "players",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_players_email", "players", ["email"], unique=False)
    op.create_index("ix_players_username", "players", ["username"], unique=False)

    op.create_table(
        "cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("card_type", card_type, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("cost", sa.Integer(), nullable=False),
        sa.Column("attack", sa.Integer(), nullable=False),
        sa.Column("health", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cards_name", "cards", ["name"], unique=False)
    op.create_index("ix_cards_card_type", "cards", ["card_type"], unique=False)

    op.create_table(
        "decks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["players.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("status", match_status, nullable=False),
        sa.Column("winner_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["winner_id"], ["players.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "deck_cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deck_id", sa.Integer(), nullable=False),
        sa.Column("card_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["cards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["deck_id"], ["decks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("deck_id", "card_id"),
    )
    op.create_table(
        "match_players",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("player_id", sa.Integer(), nullable=False),
        sa.Column("deck_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["deck_id"], ["decks.id"]),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("match_players")
    op.drop_table("deck_cards")
    op.drop_table("matches")
    op.drop_table("decks")
    op.drop_index("ix_cards_card_type", table_name="cards")
    op.drop_index("ix_cards_name", table_name="cards")
    op.drop_table("cards")
    op.drop_index("ix_players_username", table_name="players")
    op.drop_index("ix_players_email", table_name="players")
    op.drop_table("players")
    match_status.drop(op.get_bind(), checkfirst=True)
    card_type.drop(op.get_bind(), checkfirst=True)
