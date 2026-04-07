import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import Piece from "./Piece";
import Tutorial from "./Tutorial";

export default function Board({ onDrop, disabled, activeCol, onColChange }) {
  const { state } = useGame();
  const { grid, config, currentPlayer, winningCells, gameStatus, moveHistory } = state;
  const boardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
  const playerColor = currentPlayer === 1 ? config.player1Color : config.player2Color;

  const isWinning = useCallback(
    (r, c) => winningCells.some(([wr, wc]) => wr === r && wc === c),
    [winningCells]
  );

  function getColFromX(e) {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const col = Math.floor((x / rect.width) * config.cols);
    if (col < 0 || col >= config.cols) return null;
    return col;
  }

  function handleBoardMouseMove(e) {
    const col = getColFromX(e);
    if (col !== null) onColChange(col);

    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 1.5, y: -x * 1.5 });
  }

  function handleBoardMouseLeave() {
    setTilt({ x: 0, y: 0 });
    onColChange(null);
  }

  function handleBoardClick(e) {
    if (disabled) return;
    const col = getColFromX(e);
    if (col !== null) onDrop(col);
  }

  if (!grid) return null;

  const { cols } = config;
  const showGhost = activeCol !== null && gameStatus === "playing" && !disabled;

  return (
    <div className="relative select-none">
      <Tutorial />

      <div
        className="grid gap-1 px-3 mb-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, c) => {
          const isActive = showGhost && activeCol === c;
          return (
            <div key={c} className="aspect-square flex items-center justify-center">
              <motion.div
                animate={{
                  opacity: isActive ? 0.5 : 0,
                  scale: isActive ? 0.9 : 0.6,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="w-[80%] h-[80%] rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 55%),
                               radial-gradient(circle, ${playerColor}, ${playerColor})`,
                }}
              />
            </div>
          );
        })}
      </div>

      <motion.div
        ref={boardRef}
        onMouseMove={handleBoardMouseMove}
        onMouseLeave={handleBoardMouseLeave}
        onClick={handleBoardClick}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ perspective: 1200 }}
        className="rounded-2xl p-2 sm:p-3 cursor-pointer
          bg-blue-700 dark:bg-slate-700
          shadow-xl dark:shadow-2xl dark:shadow-black/50"
      >
        <motion.div
          animate={
            gameStatus === "draw"
              ? { x: [0, -4, 4, -3, 3, 0], transition: { duration: 0.5 } }
              : {}
          }
          className="grid gap-[3px] sm:gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="aspect-square rounded-full relative
                  bg-blue-100 dark:bg-slate-900
                  shadow-inner"
                data-pos={`${r}-${c}`}
              >
                {cell !== 0 && (
                  <Piece
                    key={`piece-${r}-${c}-${cell}`}
                    color={cell === 1 ? config.player1Color : config.player2Color}
                    isNew={lastMove && lastMove.row === r && lastMove.col === c}
                    row={r}
                    isWinning={isWinning(r, c)}
                  />
                )}
              </div>
            ))
          )}
        </motion.div>
      </motion.div>

      <div
        className="grid gap-1 px-3 mt-1 pointer-events-none"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <motion.div
            key={c}
            className="h-1.5 rounded-full mx-2"
            animate={{
              backgroundColor: activeCol === c && gameStatus === "playing" ? playerColor : "transparent",
              opacity: activeCol === c && gameStatus === "playing" ? 0.8 : 0,
              scaleX: activeCol === c && gameStatus === "playing" ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        ))}
      </div>
    </div>
  );
}
