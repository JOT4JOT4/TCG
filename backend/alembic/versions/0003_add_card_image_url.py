"""Add image_url column to cards.

Revision ID: 0003_add_card_image_url
Revises: 0002_combat_cards
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_add_card_image_url"
down_revision: Union[str, None] = "0002_combat_cards"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("cards", sa.Column("image_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("cards", "image_url")

