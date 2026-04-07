import sys
import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
REPO_DIR = os.path.dirname(PROJECT_DIR)
sys.path.insert(0, REPO_DIR)

from connect_four.grid import Grid, GridPosition


class GameRoom:
    def __init__(self, code: str, rows: int, cols: int, connect_n: int):
        self.code = code
        self.rows = rows
        self.cols = cols
        self.connect_n = connect_n
        self.grid = Grid(rows, cols)
        self.players = {}
        self.player_order = []
        self.websockets = {}
        self.current_turn_index = 0
        self.scores = [0, 0]
        self.move_history = []
        self.game_active = False
        self.rematch_votes = set()
        self.config = {"rows": rows, "cols": cols, "connectN": connect_n}

    @property
    def player_count(self) -> int:
        return len(self.player_order)

    @property
    def is_full(self) -> bool:
        return self.player_count >= 2

    def add_player(self, player_id: str, name: str, websocket) -> int:
        if self.is_full:
            return -1
        piece = self.player_count + 1
        self.players[player_id] = {"name": name, "piece": piece}
        self.player_order.append(player_id)
        self.websockets[player_id] = websocket
        if self.is_full:
            self.game_active = True
        return piece

    def reconnect_player(self, player_id: str, websocket):
        if player_id in self.players:
            self.websockets[player_id] = websocket
            return True
        return False

    def remove_player(self, player_id: str, full_remove: bool = False):
        self.websockets.pop(player_id, None)
        if full_remove and not self.game_active:
            if player_id in self.player_order:
                self.player_order.remove(player_id)
            self.players.pop(player_id, None)

    def get_opponent_id(self, player_id: str) -> str | None:
        for pid in self.player_order:
            if pid != player_id:
                return pid
        return None

    def make_move(self, player_id: str, col: int) -> dict:
        if not self.game_active:
            return {"type": "error", "message": "Game not active"}

        if self.player_order[self.current_turn_index] != player_id:
            return {"type": "error", "message": "Not your turn"}

        piece = GridPosition(self.current_turn_index + 1)
        try:
            row = self.grid.place_piece(col, piece)
        except ValueError as e:
            return {"type": "error", "message": str(e)}

        self.move_history.append({"col": col, "row": row, "piece": piece.value})

        if self.grid.check_n_connected(self.connect_n, row, col, piece):
            self.scores[self.current_turn_index] += 1
            winning_cells = self.grid.find_winning_cells(self.connect_n, row, col, piece)
            self.game_active = False
            return {
                "type": "game_over",
                "move": {"col": col, "row": row, "piece": piece.value},
                "result": "win",
                "winner": piece.value,
                "winnerName": self.players[player_id]["name"],
                "winningCells": winning_cells,
                "scores": self.scores,
            }

        if self.grid.is_full:
            self.game_active = False
            return {
                "type": "game_over",
                "move": {"col": col, "row": row, "piece": piece.value},
                "result": "draw",
                "scores": self.scores,
            }

        self.current_turn_index = 1 - self.current_turn_index
        return {
            "type": "move_made",
            "col": col,
            "row": row,
            "piece": piece.value,
            "nextTurn": self.current_turn_index + 1,
        }

    def start_rematch(self):
        self.grid.init_grid()
        self.move_history = []
        self.current_turn_index = 0
        self.game_active = True
        self.rematch_votes.clear()

    def get_state(self) -> dict:
        board = []
        for r in range(self.rows):
            row_data = []
            for c in range(self.cols):
                row_data.append(self.grid.board[r][c].value)
            board.append(row_data)
        return {
            "board": board,
            "currentTurn": self.current_turn_index + 1,
            "scores": self.scores,
            "gameActive": self.game_active,
            "moveHistory": self.move_history,
        }
