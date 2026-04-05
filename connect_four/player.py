from connect_four.grid import Grid, GridPosition
from connect_four.strategy import MoveStrategy

class Player:
    def __init__(self, name: str, piece_color: GridPosition, strategy: MoveStrategy):
        self._name = name
        self._piece_color = piece_color
        self._strategy = strategy
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def piece_color(self) -> GridPosition:
        return self._piece_color
    
    @property
    def strategy(self) -> MoveStrategy:
        return self._strategy
    
    @strategy.setter
    def strategy(self, new_strategy: MoveStrategy):
        self._strategy = new_strategy

    def make_move(self, grid: Grid) -> int:
        return self._strategy.get_move(grid)