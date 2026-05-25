"""Rename course instructor to subject

Revision ID: 2c2f4d9a91ab
Revises: a9c42d1f7b31
Create Date: 2026-05-25 00:00:00.000000

"""
from alembic import op


revision = "2c2f4d9a91ab"
down_revision = "a9c42d1f7b31"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("courses", "instructor", new_column_name="subject")


def downgrade():
    op.alter_column("courses", "subject", new_column_name="instructor")
