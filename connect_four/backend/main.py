import sys
import os
import string
import random
import asyncio

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
REPO_DIR = os.path.dirname(PROJECT_DIR)
sys.path.insert(0, REPO_DIR)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from connect_four.grid import Grid, GridPosition
from connect_four.strategy import RandomAIStrategy
from game_room import GameRoom

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms: dict[str, GameRoom] = {}
ai_strategy = RandomAIStrategy()


def generate_room_code() -> str:
    code = "".join(random.choices(string.ascii_uppercase, k=4))
    while code in rooms:
        code = "".join(random.choices(string.ascii_uppercase, k=4))
    return code


class CreateRoomRequest(BaseModel):
    rows: int = 6
    cols: int = 7
    connect_n: int = 4


class AIMoveRequest(BaseModel):
    board: list[list[int]]
    rows: int
    cols: int


@app.post("/api/rooms")
def create_room(req: CreateRoomRequest):
    code = generate_room_code()
    rooms[code] = GameRoom(code, req.rows, req.cols, req.connect_n)
    return {"code": code}


@app.get("/api/rooms/{code}")
def get_room(code: str):
    code = code.upper()
    if code not in rooms:
        return {"error": "Room not found"}
    room = rooms[code]
    return {
        "code": code,
        "players": room.player_count,
        "config": room.config,
        "isFull": room.is_full,
    }


@app.post("/api/ai-move")
def ai_move(req: AIMoveRequest):
    grid = Grid(req.rows, req.cols)
    for r in range(req.rows):
        for c in range(req.cols):
            val = req.board[r][c]
            if val != 0:
                grid._grid[r][c] = GridPosition(val)
                grid._move_count += 1
    col = ai_strategy.get_move(grid)
    return {"column": col}


async def broadcast(room: GameRoom, message: dict):
    for pid in room.player_order:
        ws = room.websockets.get(pid)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                pass


@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await websocket.accept()

    room_code = room_code.upper()
    if room_code not in rooms:
        await websocket.send_json({"type": "error", "message": "Room not found"})
        await websocket.close()
        return

    room = rooms[room_code]
    player_id = None

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "join":
                name = data.get("name", "Player")
                reconnect_id = data.get("playerId")

                if reconnect_id and reconnect_id in room.players:
                    room.reconnect_player(reconnect_id, websocket)
                    player_id = reconnect_id
                    piece = room.players[player_id]["piece"]
                    await websocket.send_json({
                        "type": "reconnected",
                        "piece": piece,
                        "playerId": player_id,
                        "state": room.get_state(),
                    })
                    opponent_id = room.get_opponent_id(player_id)
                    if opponent_id and opponent_id in room.websockets:
                        try:
                            await room.websockets[opponent_id].send_json({
                                "type": "opponent_reconnected",
                            })
                        except Exception:
                            pass
                    continue

                if room.is_full:
                    await websocket.send_json({"type": "error", "message": "Room is full"})
                    await websocket.close()
                    return

                player_id = f"{room_code}_{room.player_count}"
                piece = room.add_player(player_id, name, websocket)

                await websocket.send_json({
                    "type": "joined",
                    "piece": piece,
                    "playerId": player_id,
                    "config": room.config,
                })

                if room.is_full:
                    players_info = [
                        {"name": room.players[pid]["name"], "piece": room.players[pid]["piece"]}
                        for pid in room.player_order
                    ]
                    for pid in room.player_order:
                        ws = room.websockets.get(pid)
                        if ws:
                            try:
                                await ws.send_json({
                                    "type": "game_start",
                                    "players": players_info,
                                    "yourPiece": room.players[pid]["piece"],
                                    "config": room.config,
                                })
                            except Exception:
                                pass
                else:
                    await websocket.send_json({"type": "waiting", "code": room_code})

            elif msg_type == "move":
                if not player_id:
                    continue

                col = data.get("column")
                if col is None:
                    continue

                result = room.make_move(player_id, col)
                await broadcast(room, result)

            elif msg_type == "rematch":
                if not player_id:
                    continue

                room.rematch_votes.add(player_id)

                if len(room.rematch_votes) >= 2:
                    room.start_rematch()
                    players_info = [
                        {"name": room.players[pid]["name"], "piece": room.players[pid]["piece"]}
                        for pid in room.player_order
                    ]
                    await broadcast(room, {
                        "type": "rematch_start",
                        "players": players_info,
                        "scores": room.scores,
                    })
                else:
                    opponent_id = room.get_opponent_id(player_id)
                    if opponent_id and opponent_id in room.websockets:
                        try:
                            await room.websockets[opponent_id].send_json({
                                "type": "rematch_requested",
                                "by": room.players[player_id]["name"],
                            })
                        except Exception:
                            pass

    except WebSocketDisconnect:
        if player_id:
            full_remove = not room.game_active
            room.remove_player(player_id, full_remove=full_remove)
            opponent_id = room.get_opponent_id(player_id)
            if opponent_id and opponent_id in room.websockets:
                try:
                    await room.websockets[opponent_id].send_json({
                        "type": "opponent_disconnected",
                        "timeout": 30,
                    })
                except Exception:
                    pass

            await asyncio.sleep(60)
            if player_id not in room.websockets:
                if not any(pid in room.websockets for pid in room.player_order):
                    rooms.pop(room_code, None)
    except Exception:
        if player_id:
            room.remove_player(player_id)


frontend_dir = os.path.join(PROJECT_DIR, "frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="spa")
