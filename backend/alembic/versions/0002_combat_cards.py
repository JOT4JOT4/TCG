"""Migrate existing cards to the simple combat rules.

Revision ID: 0002_combat_cards
Revises: 0001_initial_schema
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_combat_cards"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE cardtype RENAME TO cardtype_old")
    op.execute("CREATE TYPE cardtype AS ENUM ('Paper', 'Rock', 'Scissors')")
    op.execute(
        """
        ALTER TABLE cards
        ALTER COLUMN card_type TYPE cardtype
        USING CASE card_type::text
            WHEN 'SPELL' THEN 'Paper'::cardtype
            WHEN 'RESOURCE' THEN 'Rock'::cardtype
            ELSE 'Scissors'::cardtype
        END
        """
    )
    op.execute("DROP TYPE cardtype_old")
    op.add_column("cards", sa.Column("power", sa.Integer(), nullable=True))
    op.execute("UPDATE cards SET power = 1 WHERE power IS NULL")
    op.alter_column("cards", "power", nullable=False)
    op.drop_column("cards", "cost")
    op.drop_column("cards", "attack")
    op.drop_column("cards", "health")

    round_result = sa.Enum("PLAYER_ONE", "PLAYER_TWO", "DRAW", name="roundresult")
    round_result.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "match_rounds",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("player_one_id", sa.Integer(), nullable=False),
        sa.Column("player_one_card_id", sa.Integer(), nullable=False),
        sa.Column("player_two_id", sa.Integer(), nullable=False),
        sa.Column("player_two_card_id", sa.Integer(), nullable=False),
        sa.Column("result", round_result, nullable=False),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["player_one_id"], ["players.id"]),
        sa.ForeignKeyConstraint(["player_one_card_id"], ["cards.id"]),
        sa.ForeignKeyConstraint(["player_two_id"], ["players.id"]),
        sa.ForeignKeyConstraint(["player_two_card_id"], ["cards.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("match_rounds")
    sa.Enum(name="roundresult").drop(op.get_bind(), checkfirst=True)
    op.add_column("cards", sa.Column("health", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("cards", sa.Column("attack", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("cards", sa.Column("cost", sa.Integer(), nullable=False, server_default="0"))
    op.drop_column("cards", "power")
    op.execute("ALTER TYPE cardtype RENAME TO cardtype_new")
    op.execute("CREATE TYPE cardtype AS ENUM ('CREATURE', 'SPELL', 'RESOURCE')")
    op.execute(
        """
        ALTER TABLE cards
        ALTER COLUMN card_type TYPE cardtype
        USING CASE card_type::text
            WHEN 'Paper' THEN 'SPELL'::cardtype
            WHEN 'Rock' THEN 'RESOURCE'::cardtype
            ELSE 'CREATURE'::cardtype
        END
        """
    )
    op.execute("DROP TYPE cardtype_new")