# Connect Four

A premium Connect Four web app with real-time online multiplayer, AI opponent, and polished game feel.

## Modes

- **Local** — Two players, same browser
- **vs Computer** — Play against RandomAIStrategy from the original codebase
- **Online** — Create a room, share the 4-letter code, play with a friend

## Quick Start

### Backend

```bash
cd connect_four/backend
pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd connect_four/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Render (free)

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Docker
3. Connect your repo — it auto-detects the Dockerfile
4. Free plan works. Done.

## Controls

| Key | Action |
|-----|--------|
| A / D | Select column |
| S / Space / Enter | Drop piece |
| W | Undo |
| R | Restart round |
| Esc | Settings |

Mouse click on any column also works.

## Architecture

```
connect_four/                  # Python package (original OOD code)
  grid.py                      # Grid class — board state, win detection, find_winning_cells
  strategy.py                  # MoveStrategy ABC, HumanStrategy, RandomAIStrategy
  player.py                    # Player class
  game.py                      # Terminal Game class (untouched, still works)
  websocket_strategy.py        # WebSocketStrategy (new, extends MoveStrategy)

  backend/                     # FastAPI web server
    main.py                    # REST + WebSocket endpoints, serves frontend in prod
    game_room.py               # GameRoom — uses Grid + RandomAIStrategy for web play

  frontend/                    # React + Vite + Tailwind + Framer Motion
    src/
      game/gridLogic.js        # JS mirror of Grid for client-side local/AI play
      contexts/                # Theme + Game state (reducer)
      hooks/                   # Sound, keyboard, WebSocket
      components/              # All UI
      utils/                   # Stats, haptics
```

## What the web app uses from the original code

- **Grid** — all board state, `place_piece`, `check_n_connected`, `find_winning_cells`
- **GridPosition** — EMPTY/RED/YELLOW piece enum
- **RandomAIStrategy** — computer opponent (called via `/api/ai-move` endpoint)
- **WebSocketStrategy** — async move strategy for online play
- **Game class** — NOT used by the web app (it has a blocking terminal loop). Still works for CLI play.
