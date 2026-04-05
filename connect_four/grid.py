import enum

class GridPosition(enum.Enum):
    EMPTY = 0
    RED = 1
    YELLOW = 2

class Grid:
    def __init__(self, rows: int, cols: int):
        self._rows = rows
        self._cols = cols
        self._grid = None
        self._move_count = 0
        self.init_grid()

    def init_grid(self):
        self._grid = [[GridPosition.EMPTY for _ in range(self._cols)] for _ in range(self._rows)] 
        self._move_count = 0
    
    @property
    def column_count(self) -> int:
        return self._cols

    @property 
    def row_count(self) -> int:
        return self._rows
    
    @property
    def board(self) -> list[list[GridPosition]]:
        return self._grid

    @property 
    def is_full(self) -> bool:
        return self._move_count >= self._rows * self._cols

    def is_column_full(self, col: int) -> bool:
        return self._grid[0][col] != GridPosition.EMPTY

    def place_piece(self, col: int, piece: GridPosition) -> int:
        if col < 0 or col >= self._cols:
            raise ValueError(f"Column {col} out of range (0-{self._cols-1})")
        if piece == GridPosition.EMPTY:
            raise ValueError("Cannot place an empty piece")
        if self.is_column_full(col):
            raise ValueError(f"Column {col} is full")
    
        for row in range(self._rows-1, -1, -1):
            if self._grid[row][col] == GridPosition.EMPTY:
                self._grid[row][col] = piece
                self._move_count += 1
                return row
    
    def check_n_connected(self, n: int, row: int, col: int, piece: GridPosition) -> bool:
        count = 0
        for c in range(self._cols):
            if self._grid[row][c] == piece:
                count += 1
            else:
                count = 0
            if count == n:
                return True
        
        count = 0
        for r in range(self._rows):
            if self._grid[r][col] == piece:
                count += 1
            else:
                count = 0
            if count == n:
                return True
        
        count = 0
        for i in range(self._rows):
            c = row + col - i
            if c < 0 or c >= self._cols:
                continue
            if self._grid[i][c] == piece:
                count += 1
            else:
                count = 0
            if count == n:
                return True
        
        count = 0
        for i in range(self._rows):
            c = col - row + i
            if c < 0 or c >= self._cols:
                continue
            if self._grid[i][c] == piece:
                count += 1
            else:
                count = 0
            if count == n:
                return True
        return False