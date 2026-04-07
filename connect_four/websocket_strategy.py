import asyncio

from connect_four.strategy import MoveStrategy
from connect_four.grid import Grid


class WebSocketStrategy(MoveStrategy):
    def __init__(self):
        self._move_queue = asyncio.Queue()

    async def wait_for_move(self) -> int:
        return await self._move_queue.get()

    def submit_move(self, column: int):
        self._move_queue.put_nowait(column)

    def get_move(self, grid: Grid) -> int:
        raise NotImplementedError(
            "WebSocketStrategy is async-only. Use wait_for_move() instead."
        )
