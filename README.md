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

> Aún faltan la lógica de dominio, migraciones y autenticación. Esta base solo deja listo el esqueleto inicial.
