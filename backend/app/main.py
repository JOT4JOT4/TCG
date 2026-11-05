from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import settings
from app.db.seed import seed_cards
from app.db.session import SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception as err:
        print(f"[Startup] Alembic auto-upgrade notice: {err}")

    try:
        with SessionLocal() as db:
            added = seed_cards(db)
            if added > 0:
                print(f"[Startup] Seeded {added} initial cards into database.")
    except Exception as err:
        print(f"[Startup] Database seed notice: {err}")

    yield


app = FastAPI(title="TCG Backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
