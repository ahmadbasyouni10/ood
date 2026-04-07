import { createContext, useContext, useReducer, useCallback } from "react";
import {
  createEmptyGrid,
  checkNConnected,
  getWinningCells,
} from "../game/gridLogic";

const GameContext = createContext();

const defaultConfig = {
  rows: 6,
  cols: 7,
  connectN: 4,
  bestOf: 1,
  player1Name: "Player 1",
  player2Name: "Player 2",
  player1Color: "#EF4444",
  player2Color: "#EAB308",
};

const initialState = {
  screen: "landing",
  mode: null,
  config: { ...defaultConfig },
  grid: null,
  currentPlayer: 1,
  moveHistory: [],
  redoStack: [],
  scores: [0, 0],
  roundResults: [],
  gameStatus: "playing",
  winner: null,
  winningCells: [],
  moveCount: 0,
  roomCode: null,
  myPiece: null,
  playerId: null,
  opponentName: null,
  opponentConnected: true,
  waitingForOpponent: false,
};

function rebuildGrid(rows, cols, moves) {
  const grid = createEmptyGrid(rows, cols);
  for (const move of moves) {
    grid[move.row][move.col] = move.piece;
  }
  return grid;
}

function gameReducer(state, action) {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, screen: action.screen };

    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        config: {
          ...state.config,
          player2Name: action.mode === "computer" ? "Computer" : state.config.player2Name === "Computer" ? "Player 2" : state.config.player2Name,
        },
      };

    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };

    case "START_GAME": {
      const { rows, cols } = state.config;
      return {
        ...state,
        screen: "game",
        grid: createEmptyGrid(rows, cols),
        currentPlayer: 1,
        moveHistory: [],
        redoStack: [],
        gameStatus: "playing",
        winner: null,
        winningCells: [],
        moveCount: 0,
      };
    }

    case "PLACE_PIECE": {
      if (state.gameStatus !== "playing") return state;
      const { col } = action;
      const { rows, cols, connectN } = state.config;

      if (col < 0 || col >= cols) return state;

      const newGrid = state.grid.map((r) => [...r]);

      let landRow = -1;
      for (let r = rows - 1; r >= 0; r--) {
        if (newGrid[r][col] === 0) {
          landRow = r;
          break;
        }
      }
      if (landRow === -1) return state;

      newGrid[landRow][col] = state.currentPlayer;
      const move = { col, row: landRow, piece: state.currentPlayer };
      const newHistory = [...state.moveHistory, move];
      const newMoveCount = state.moveCount + 1;

      if (checkNConnected(newGrid, connectN, landRow, col, state.currentPlayer)) {
        const cells = getWinningCells(newGrid, connectN, landRow, col, state.currentPlayer);
        const newScores = [...state.scores];
        newScores[state.currentPlayer - 1]++;
        return {
          ...state,
          grid: newGrid,
          moveHistory: newHistory,
          redoStack: [],
          moveCount: newMoveCount,
          gameStatus: "won",
          winner: state.currentPlayer,
          winningCells: cells,
          scores: newScores,
          roundResults: [
            ...state.roundResults,
            { winner: state.currentPlayer, moves: newMoveCount },
          ],
        };
      }

      if (newMoveCount >= rows * cols) {
        return {
          ...state,
          grid: newGrid,
          moveHistory: newHistory,
          redoStack: [],
          moveCount: newMoveCount,
          gameStatus: "draw",
          roundResults: [
            ...state.roundResults,
            { winner: null, moves: newMoveCount },
          ],
        };
      }

      return {
        ...state,
        grid: newGrid,
        moveHistory: newHistory,
        redoStack: [],
        moveCount: newMoveCount,
        currentPlayer: state.currentPlayer === 1 ? 2 : 1,
      };
    }

    case "RECEIVE_MOVE": {
      const { col, row, piece } = action;
      const { connectN } = state.config;

      const newGrid = state.grid.map((r) => [...r]);
      newGrid[row][col] = piece;
      const move = { col, row, piece };
      const newHistory = [...state.moveHistory, move];
      const newMoveCount = state.moveCount + 1;

      if (checkNConnected(newGrid, connectN, row, col, piece)) {
        const cells = getWinningCells(newGrid, connectN, row, col, piece);
        const newScores = [...state.scores];
        newScores[piece - 1]++;
        return {
          ...state,
          grid: newGrid,
          moveHistory: newHistory,
          moveCount: newMoveCount,
          gameStatus: "won",
          winner: piece,
          winningCells: cells,
          scores: newScores,
          roundResults: [
            ...state.roundResults,
            { winner: piece, moves: newMoveCount },
          ],
        };
      }

      if (newMoveCount >= state.config.rows * state.config.cols) {
        return {
          ...state,
          grid: newGrid,
          moveHistory: newHistory,
          moveCount: newMoveCount,
          gameStatus: "draw",
          roundResults: [
            ...state.roundResults,
            { winner: null, moves: newMoveCount },
          ],
        };
      }

      return {
        ...state,
        grid: newGrid,
        moveHistory: newHistory,
        moveCount: newMoveCount,
        currentPlayer: piece === 1 ? 2 : 1,
      };
    }

    case "UNDO": {
      if (state.moveHistory.length === 0 || state.gameStatus !== "playing") return state;
      const undoCount = state.mode === "computer" ? Math.min(2, state.moveHistory.length) : 1;
      const undone = state.moveHistory.slice(-undoCount);
      const remaining = state.moveHistory.slice(0, -undoCount);
      const newGrid = rebuildGrid(state.config.rows, state.config.cols, remaining);

      return {
        ...state,
        grid: newGrid,
        moveHistory: remaining,
        redoStack: [...state.redoStack, ...undone],
        moveCount: remaining.length,
        currentPlayer: undone[0].piece,
        gameStatus: "playing",
        winner: null,
        winningCells: [],
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0 || state.gameStatus !== "playing") return state;
      const redoCount = state.mode === "computer" ? Math.min(2, state.redoStack.length) : 1;
      const redone = state.redoStack.slice(-redoCount).reverse();
      const newGrid = state.grid.map((r) => [...r]);

      for (const move of redone) {
        newGrid[move.row][move.col] = move.piece;
      }

      const last = redone[redone.length - 1];
      const newHistory = [...state.moveHistory, ...redone];
      const { connectN } = state.config;

      if (checkNConnected(newGrid, connectN, last.row, last.col, last.piece)) {
        const cells = getWinningCells(newGrid, connectN, last.row, last.col, last.piece);
        const newScores = [...state.scores];
        newScores[last.piece - 1]++;
        return {
          ...state,
          grid: newGrid,
          moveHistory: newHistory,
          redoStack: state.redoStack.slice(0, -redoCount),
          moveCount: newHistory.length,
          gameStatus: "won",
          winner: last.piece,
          winningCells: cells,
          scores: newScores,
          roundResults: [
            ...state.roundResults,
            { winner: last.piece, moves: newHistory.length },
          ],
        };
      }

      return {
        ...state,
        grid: newGrid,
        moveHistory: newHistory,
        redoStack: state.redoStack.slice(0, -redoCount),
        moveCount: newHistory.length,
        currentPlayer: last.piece === 1 ? 2 : 1,
      };
    }

    case "NEW_ROUND": {
      const { rows, cols } = state.config;
      return {
        ...state,
        grid: createEmptyGrid(rows, cols),
        currentPlayer: 1,
        moveHistory: [],
        redoStack: [],
        gameStatus: "playing",
        winner: null,
        winningCells: [],
        moveCount: 0,
      };
    }

    case "RESTART_ROUND": {
      const { rows, cols } = state.config;
      return {
        ...state,
        grid: createEmptyGrid(rows, cols),
        currentPlayer: 1,
        moveHistory: [],
        redoStack: [],
        gameStatus: "playing",
        winner: null,
        winningCells: [],
        moveCount: 0,
      };
    }

    case "RESET_ALL":
      return {
        ...initialState,
        config: { ...defaultConfig },
      };

    case "SET_ROOM":
      return { ...state, roomCode: action.code };

    case "SET_MY_PIECE":
      return { ...state, myPiece: action.piece, playerId: action.playerId ?? state.playerId };

    case "OPPONENT_JOINED":
      return { ...state, opponentName: action.name, waitingForOpponent: false };

    case "OPPONENT_DISCONNECTED":
      return { ...state, opponentConnected: false };

    case "OPPONENT_RECONNECTED":
      return { ...state, opponentConnected: true };

    case "SET_WAITING":
      return { ...state, waitingForOpponent: true };

    case "UPDATE_SCORES":
      return { ...state, scores: [...action.scores] };

    case "SET_ONLINE_CONFIG":
      return {
        ...state,
        config: {
          ...state.config,
          rows: action.config.rows,
          cols: action.config.cols,
          connectN: action.config.connectN,
        },
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const placePiece = useCallback((col) => dispatch({ type: "PLACE_PIECE", col }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const newRound = useCallback(() => dispatch({ type: "NEW_ROUND" }), []);
  const restart = useCallback(() => dispatch({ type: "RESTART_ROUND" }), []);
  const resetAll = useCallback(() => dispatch({ type: "RESET_ALL" }), []);
  const navigate = useCallback((screen) => dispatch({ type: "NAVIGATE", screen }), []);

  return (
    <GameContext.Provider
      value={{ state, dispatch, placePiece, undo, redo, newRound, restart, resetAll, navigate }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
