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

## Flujo de un combate

La pantalla de partida prepara un mazo mezclado para cada jugador y reparte cinco
cartas iniciales. En cada ronda el jugador selecciona una carta de su mano; la
carta pasa al campo boca abajo mientras el rival selecciona la suya. Cuando ambas
están listas se revelan, se resuelve la efectividad y el poder, y las dos cartas
pasan al cementerio. El perdedor de la ronda pierde una vida; en los empates no
se pierde vida. Mientras ambos jugadores conserven vida se roba una carta para la
siguiente ronda. Al llegar una vida a cero, el combate termina y se muestra el
ganador.

## API de combate

El frontend no calcula reglas ni mantiene el estado de la partida. La partida se
administra mediante estos endpoints del backend:

- `POST /api/combat/games`: crea una partida, mezcla los mazos y reparte cinco cartas.
- `GET /api/combat/games/{game_id}`: obtiene el estado actual sin revelar cartas ocultas.
- `POST /api/combat/games/{game_id}/choice` con `{"card_id": 1}`: juega una carta.
- `POST /api/combat/games/{game_id}/reveal`: revela y calcula el resultado de las cartas.
- `POST /api/combat/games/{game_id}/resolve`: aplica vida, cementerio y siguiente ronda.

En esta primera integración el estado de las partidas de combate vive en memoria
del proceso de FastAPI. Reiniciar el backend elimina esas partidas; la persistencia
de partidas reales en PostgreSQL queda como el siguiente paso.
