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

## Requisitos

Para desarrollo local necesitas:

- Python 3.12 o superior.
- Node.js 22 o superior y npm.
- Docker Desktop, si vas a ejecutar PostgreSQL mediante Docker.

Los comandos siguientes están escritos para PowerShell en Windows. Desde macOS/Linux cambia la activación del entorno virtual por la equivalente de tu sistema.

## Ejecutar los tests

Los tests del backend usan SQLite en memoria. No necesitas iniciar PostgreSQL para ejecutarlos.

1. Abre PowerShell en la raíz del repositorio.
2. Crea y activa un entorno virtual:

  ```powershell
  cd backend
  py -3.12 -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```

  Si PowerShell bloquea la activación por la política de ejecución, ejecuta una vez:

  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```

3. Instala el backend y sus dependencias de desarrollo:

  ```powershell
  python -m pip install --upgrade pip
  python -m pip install -e ".[dev]"
  ```

4. Ejecuta las pruebas desde la carpeta `backend`:

  ```powershell
  python -m pytest -q
  ```

El fixture de [tests/conftest.py](backend/tests/conftest.py) crea las tablas en una base SQLite temporal para cada test y elimina todo al terminar.

## Ejecutar en local

### 1. Iniciar PostgreSQL

Desde la raíz del repositorio:

```powershell
docker compose up -d db
```

La base queda disponible en `localhost:5432` con estos valores:

```text
Base de datos: tcg
Usuario:       tcg_user
Contraseña:    tcg_password
```

### 2. Preparar el backend

En una terminal con el entorno virtual activo:

```powershell
cd backend
python -m pip install -e ".[dev]"
alembic upgrade head
```

La migración crea las tablas de jugadores, cartas, mazos, partidas y rondas de combate. El backend también intenta aplicar la migración y cargar cartas iniciales al iniciar.

### 3. Iniciar la API

Desde `backend`:

```powershell
python -m uvicorn app.main:app --reload
```

La API estará disponible en:

- `http://localhost:8000`
- Documentación Swagger: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 4. Iniciar el frontend

Abre otra terminal en la raíz del repositorio:

```powershell
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y usará `http://localhost:8000` como API por defecto.

## Ejecutar todo con Docker

Desde la raíz del repositorio:

```powershell
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

Para detener los servicios:

```powershell
docker compose down
```

Para eliminar también los datos persistidos de PostgreSQL:

```powershell
docker compose down -v
```

## Migraciones

Los comandos se ejecutan desde `backend`:

```powershell
alembic upgrade head       # aplicar todas las migraciones
alembic current            # revisar la versión actual
alembic history            # listar migraciones
alembic downgrade -1       # retroceder una migración
```

## Problemas habituales

- `No module named pytest`: activa `.venv` y ejecuta `python -m pip install -e ".[dev]"`.
- `alembic` no se reconoce: confirma que el entorno virtual está activo y reinstala con `python -m pip install -e ".[dev]"`.
- Error de conexión a PostgreSQL: confirma que Docker Desktop está activo y ejecuta `docker compose ps`.
- El puerto `5432`, `8000` o `5173` está ocupado: detén el proceso que lo usa o cambia el puerto en `docker-compose.yml`.

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
