import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import { useSound } from "../hooks/useSound";
import { useKeyboard } from "../hooks/useKeyboard";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "./Toast";
import { recordGame } from "../utils/stats";
import { vibrateShort, vibrateLong } from "../utils/haptics";
import Board from "./Board";
import WinScreen from "./WinScreen";
import Settings from "./Settings";
import GameHistory from "./GameHistory";
import ThemeToggle from "./ThemeToggle";

export default function GameBoard() {
  const { state, dispatch, placePiece, undo, redo, newRound, restart, resetAll, navigate } = useGame();
  const { config, mode, currentPlayer, gameStatus, winner, scores, moveCount, myPiece, roomCode, opponentConnected, playerId, waitingForOpponent } = state;
  const sound = useSound();
  const { addToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { connect, send, disconnect, connected } = useWebSocket();
  const sendRef = useRef(send);
  const [disconnectCountdown, setDisconnectCountdown] = useState(null);
  const [activeCol, setActiveCol] = useState(Math.floor(config.cols / 2));
  const usingMouse = useRef(false);
  const [copied, setCopied] = useState(false);
  const statsRecorded = useRef(false);

  useEffect(() => { sendRef.current = send; }, [send]);

  const isOnline = mode === "online";
  const isAiTurn = mode === "computer" && currentPlayer === 2;
  const isMyTurn = isOnline ? currentPlayer === myPiece : !isAiTurn;
  const disabled = !isMyTurn || gameStatus !== "playing" || waitingForOpponent;

  const playerName = (piece) => piece === 1 ? config.player1Name : config.player2Name;
  const playerColor = (piece) => piece === 1 ? config.player1Color : config.player2Color;

  const myPieceRef = useRef(myPiece);
  useEffect(() => { myPieceRef.current = myPiece; }, [myPiece]);

  function handleOnlineMessage(msg) {
    switch (msg.type) {
      case "joined":
        dispatch({ type: "SET_MY_PIECE", piece: msg.piece, playerId: msg.playerId });
        break;
      case "waiting":
        break;
      case "game_start": {
        const opponentName = msg.players.find((p) => p.piece !== myPieceRef.current)?.name;
        dispatch({
          type: "UPDATE_CONFIG",
          payload: { player1Name: msg.players[0].name, player2Name: msg.players[1].name },
        });
        dispatch({ type: "OPPONENT_JOINED", name: opponentName });
        break;
      }
      case "move_made":
        dispatch({ type: "RECEIVE_MOVE", col: msg.col, row: msg.row, piece: msg.piece });
        sound.drop();
        vibrateShort();
        break;
      case "game_over":
        if (msg.move) {
          dispatch({ type: "RECEIVE_MOVE", col: msg.move.col, row: msg.move.row, piece: msg.move.piece });
        }
        if (msg.result === "win") { sound.win(); vibrateLong(); }
        else { sound.draw(); }
        if (msg.scores) dispatch({ type: "UPDATE_SCORES", scores: msg.scores });
        break;
      case "opponent_disconnected":
        dispatch({ type: "OPPONENT_DISCONNECTED" });
        setDisconnectCountdown(msg.timeout || 30);
        addToast("Opponent disconnected", "warning");
        break;
      case "opponent_reconnected":
        dispatch({ type: "OPPONENT_RECONNECTED" });
        setDisconnectCountdown(null);
        addToast("Opponent reconnected", "success");
        break;
      case "rematch_requested":
        addToast(`${msg.by} wants a rematch`, "info");
        break;
      case "rematch_start":
        dispatch({ type: "NEW_ROUND" });
        if (msg.scores) dispatch({ type: "UPDATE_SCORES", scores: msg.scores });
        addToast("New round!", "success");
        statsRecorded.current = false;
        break;
      case "error":
        addToast(msg.message, "error");
        break;
    }
  }

  useEffect(() => {
    if (isOnline && roomCode) {
      const myName = myPiece === 1 ? config.player1Name : config.player2Name;
      connect(roomCode, handleOnlineMessage, { type: "join", name: myName, playerId });
    }
    return () => { if (isOnline) disconnect(); };
  }, []);

  useEffect(() => {
    if (disconnectCountdown === null || disconnectCountdown <= 0) return;
    const t = setTimeout(() => setDisconnectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [disconnectCountdown]);

  const handleDropRef = useRef(null);
  handleDropRef.current = (col) => {
    if (disabled) return;
    if (isOnline) {
      sendRef.current({ type: "move", column: col });
    } else {
      placePiece(col);
      sound.drop();
      vibrateShort();
    }
  };

  function handleDrop(col) {
    handleDropRef.current(col);
  }

  useEffect(() => {
    if (mode !== "computer" || gameStatus !== "playing" || currentPlayer !== 2) return;
    const timer = setTimeout(async () => {
      let col;
      try {
        const res = await fetch("/api/ai-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board: state.grid, rows: config.rows, cols: config.cols }),
        });
        const data = await res.json();
        col = data.column;
      } catch {
        const available = [];
        for (let c = 0; c < config.cols; c++) {
          if (state.grid[0][c] === 0) available.push(c);
        }
        col = available[Math.floor(Math.random() * available.length)];
      }
      if (col !== undefined && col !== null) {
        placePiece(col);
        sound.drop();
        vibrateShort();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [currentPlayer, mode, gameStatus]);

  useEffect(() => {
    if (statsRecorded.current) return;
    if (gameStatus === "won") {
      sound.win();
      vibrateLong();
      recordGame(config.player1Name, config.player2Name, winner, moveCount);
      statsRecorded.current = true;
    } else if (gameStatus === "draw") {
      sound.draw();
      recordGame(config.player1Name, config.player2Name, null, moveCount);
      statsRecorded.current = true;
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === "won") {
      document.title = `${playerName(winner)} wins! — Connect Four`;
    } else if (gameStatus === "playing") {
      document.title = `${playerName(currentPlayer)}'s turn — Connect Four`;
    } else {
      document.title = "Connect Four";
    }
    updateFavicon(playerColor(currentPlayer));
  }, [gameStatus, currentPlayer, winner]);

  function updateFavicon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${color}"/></svg>`;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.type = "image/svg+xml";
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function handleRematch() {
    statsRecorded.current = false;
    if (isOnline) {
      sendRef.current({ type: "rematch" });
      addToast("Rematch requested", "info");
    } else {
      newRound();
    }
  }

  function handleMenu() {
    if (isOnline) disconnect();
    resetAll();
    document.title = "Connect Four";
    navigate("landing");
  }

  function handleColChange(col) {
    usingMouse.current = col !== null;
    if (col !== null) setActiveCol(col);
  }

  const handleLeft = useCallback(() => {
    usingMouse.current = false;
    setActiveCol((prev) => Math.max(0, prev - 1));
  }, []);

  const handleRight = useCallback(() => {
    usingMouse.current = false;
    setActiveCol((prev) => Math.min(config.cols - 1, prev + 1));
  }, [config.cols]);

  const handleKeyDrop = useCallback(() => {
    handleDropRef.current(activeCol);
  }, [activeCol]);

  const handleUndo = useCallback(() => {
    if (!isOnline) undo();
  }, [isOnline, undo]);

  useKeyboard({
    onLeft: handleLeft,
    onRight: handleRight,
    onDrop: handleKeyDrop,
    onUndo: handleUndo,
    onRestart: isOnline ? undefined : restart,
    onEscape: () => setSettingsOpen(true),
    enabled: gameStatus === "playing" && !waitingForOpponent,
  });

  const targetScore = Math.ceil(config.bestOf / 2);

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isOnline && waitingForOpponent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-4 gap-6"
      >
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm
          rounded-2xl p-10 border border-white/30 dark:border-white/10
          text-center space-y-6 max-w-sm w-full">
          <h2 className="text-xl font-bold text-stone-800 dark:text-slate-100">
            Share this code with your friend
          </h2>

          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl font-black tracking-[0.3em]
              text-stone-800 dark:text-slate-100 py-4"
          >
            {roomCode}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="px-8 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white"
          >
            {copied ? "✓ Copied!" : "Copy Code"}
          </motion.button>

          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-stone-500 dark:text-slate-400 text-sm"
          >
            Waiting for opponent to join...
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMenu}
            className="text-sm text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-4"
    >
      <div className="w-full max-w-xl relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <GameHistory />
          </div>

          <div className="flex items-center gap-3 text-sm font-bold">
            <motion.div
              animate={{ scale: currentPlayer === 1 ? 1.15 : 0.9, opacity: currentPlayer === 1 ? 1 : 0.5 }}
              className="flex items-center gap-1.5"
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.player1Color }} />
              <span className="text-stone-700 dark:text-slate-200 hidden sm:inline">
                {config.player1Name}
              </span>
              <span className="text-stone-800 dark:text-slate-100">{scores[0]}</span>
            </motion.div>

            <span className="text-stone-300 dark:text-slate-600 text-xs">vs</span>

            <motion.div
              animate={{ scale: currentPlayer === 2 ? 1.15 : 0.9, opacity: currentPlayer === 2 ? 1 : 0.5 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-stone-800 dark:text-slate-100">{scores[1]}</span>
              <span className="text-stone-700 dark:text-slate-200 hidden sm:inline">
                {config.player2Name}
              </span>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.player2Color }} />
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={restart}
                className="w-9 h-9 rounded-full flex items-center justify-center
                  bg-white/10 dark:bg-white/5 backdrop-blur-sm
                  border border-white/20 dark:border-white/10
                  text-stone-500 dark:text-slate-400 text-sm"
                title="Restart (R)"
              >
                ↻
              </motion.button>
            )}
            {!isOnline && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={undo}
                disabled={state.moveHistory.length === 0 || gameStatus !== "playing"}
                className="w-9 h-9 rounded-full flex items-center justify-center
                  bg-white/10 dark:bg-white/5 backdrop-blur-sm
                  border border-white/20 dark:border-white/10
                  text-stone-500 dark:text-slate-400 text-sm
                  disabled:opacity-30"
                title="Undo (W)"
              >
                ↩
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center
                bg-white/10 dark:bg-white/5 backdrop-blur-sm
                border border-white/20 dark:border-white/10
                text-stone-500 dark:text-slate-400 text-sm"
              title="Settings (Esc)"
            >
              ⚙
            </motion.button>
          </div>
        </div>

        {config.bestOf > 1 && (
          <div className="text-center text-xs text-stone-400 dark:text-slate-500 mb-2">
            Best of {config.bestOf} — First to {targetScore}
          </div>
        )}

        {gameStatus === "playing" && (
          <motion.div
            key={currentPlayer}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <span className="text-sm font-medium text-stone-500 dark:text-slate-400">
              {isAiTurn
                ? "Computer is thinking..."
                : isOnline && !isMyTurn
                  ? `Waiting for ${playerName(currentPlayer)}...`
                  : `${playerName(currentPlayer)}'s turn`}
            </span>
            <span className="text-xs text-stone-400 dark:text-slate-500 ml-2">
              Move {moveCount + 1}
            </span>
          </motion.div>
        )}

        {!opponentConnected && disconnectCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-3 text-sm text-yellow-500"
          >
            Opponent disconnected. Waiting {disconnectCountdown}s...
          </motion.div>
        )}

        <Board
          onDrop={handleDrop}
          disabled={disabled}
          activeCol={disabled ? null : activeCol}
          onColChange={handleColChange}
        />

        <div className="text-center mt-3 text-xs text-stone-400 dark:text-slate-500">
          A/D move · S drop · W undo · R restart
        </div>
      </div>

      <WinScreen onRematch={handleRematch} onMenu={handleMenu} />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        soundEnabled={sound.enabled}
        onToggleSound={sound.toggle}
        onForfeit={handleMenu}
        showForfeit={gameStatus === "playing"}
      />
    </motion.div>
  );
}
