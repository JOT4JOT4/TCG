# TCG Monolith

Base monolítica para un TCG básico con:

- Backend: Python + FastAPI
- Frontend: React + Vite
- Base de datos: PostgreSQL
- Orquestación local: Docker Compose

## Estructura

```text
backend/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
  tests/
frontend/
  src/
  public/
```

## Arranque previsto

- Backend: `uvicorn app.main:app --reload`
- Frontend: `npm run dev`
- Base de datos: `docker compose up db`
- Migraciones: `cd backend` y después `alembic upgrade head`
- Tests: `cd backend` y después `pytest`

La aplicación usa PostgreSQL en ejecución normal. Los tests usan una base SQLite temporal en memoria, por lo que no modifican la base local.

## Regla de combate inicial

Cada carta tiene un tipo (`logia`, `paramecia` o `zoan`) y un poder del 1 al 9.
La efectividad sigue este ciclo: `logia > paramecia > zoan > logia`.
Si ambas cartas son del mismo tipo, gana el poder mayor; si tipo y poder coinciden, la ronda termina en empate.
