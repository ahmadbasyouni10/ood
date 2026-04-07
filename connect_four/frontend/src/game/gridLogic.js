export function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function placePiece(grid, col, piece) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (col < 0 || col >= cols) return -1;
  if (grid[0][col] !== 0) return -1;

  for (let r = rows - 1; r >= 0; r--) {
    if (grid[r][col] === 0) {
      grid[r][col] = piece;
      return r;
    }
  }
  return -1;
}

export function isColumnFull(grid, col) {
  return grid[0][col] !== 0;
}

export function isBoardFull(grid) {
  return grid[0].every((cell) => cell !== 0);
}

export function checkNConnected(grid, n, row, col, piece) {
  const rows = grid.length;
  const cols = grid[0].length;

  let count = 0;
  for (let c = 0; c < cols; c++) {
    count = grid[row][c] === piece ? count + 1 : 0;
    if (count === n) return true;
  }

  count = 0;
  for (let r = 0; r < rows; r++) {
    count = grid[r][col] === piece ? count + 1 : 0;
    if (count === n) return true;
  }

  count = 0;
  for (let i = 0; i < rows; i++) {
    const c = row + col - i;
    if (c < 0 || c >= cols) continue;
    count = grid[i][c] === piece ? count + 1 : 0;
    if (count === n) return true;
  }

  count = 0;
  for (let i = 0; i < rows; i++) {
    const c = col - row + i;
    if (c < 0 || c >= cols) continue;
    count = grid[i][c] === piece ? count + 1 : 0;
    if (count === n) return true;
  }

  return false;
}

export function getWinningCells(grid, n, row, col, piece) {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dr, dc] of directions) {
    const cells = [[row, col]];

    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === piece) {
      cells.push([r, c]);
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === piece) {
      cells.push([r, c]);
      r -= dr;
      c -= dc;
    }

    if (cells.length >= n) return cells.slice(0, n);
  }

  return [];
}
