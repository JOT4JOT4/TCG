from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
from contextlib import asynccontextmanager

from app.db.session import SessionLocal
from app.db.seed import seed_players

from app.api.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("SEED_DEMO_PLAYERS", "false").lower() == "true":
        with SessionLocal() as db:
            added = seed_players(db)
            print(f"[Startup] Jugadores de prueba creados: {added}")

    yield


app = FastAPI(title="TCG Backend", version="0.1.0", lifespan=lifespan,)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://jot4jot4.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
