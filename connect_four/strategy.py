import random
from abc import ABC, abstractmethod

from connect_four.grid import Grid

class MoveStrategy(ABC):
    @abstractmethod
    def get_move(self, grid: Grid) -> int:
        pass

class HumanStrategy(MoveStrategy):
    def get_move(self, grid: Grid) -> int:
        col_count = grid.column_count
        while True:
            try:
                col = int(input(f"Enter column between 0 and {col_count-1}: "))
                if col < 0 or col >= col_count:
                    print(f"Invalid column. Please enter a number between 0 and {col_count-1}.")
                return col
            except ValueError:
                print("Invalid input. Please enter a valid integer.")

class RandomAIStrategy(MoveStrategy):
    def get_move(self, grid: Grid) -> int:
        available_cols = [col for col in range(grid.column_count) if not grid.is_column_full(col)]
        if not available_cols:
            raise ValueError("No available columns to make a move.")
        return random.choice(available_cols)