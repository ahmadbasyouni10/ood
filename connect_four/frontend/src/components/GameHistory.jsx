import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../contexts/GameContext";

export default function GameHistory() {
  const { state } = useGame();
  const { roundResults, config, scores } = state;
  const [open, setOpen] = useState(false);

  if (roundResults.length === 0) return null;

  const targetScore = Math.ceil(config.bestOf / 2);

  function playerName(piece) {
    return piece === 1 ? config.player1Name : config.player2Name;
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium
          bg-white/10 dark:bg-white/5 backdrop-blur-sm
          border border-white/20 dark:border-white/10
          text-stone-600 dark:text-slate-300"
      >
        History ({roundResults.length})
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 z-30
              bg-white dark:bg-slate-800 rounded-xl shadow-xl
              border border-stone-200 dark:border-slate-600
              p-3 min-w-[200px] max-h-[300px] overflow-y-auto"
          >
            {config.bestOf > 1 && (
              <div className="text-xs text-stone-400 dark:text-slate-500 mb-2 pb-2
                border-b border-stone-100 dark:border-slate-700">
                First to {targetScore} — {scores[0]}:{scores[1]}
              </div>
            )}
            {roundResults.map((result, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 text-sm
                  text-stone-600 dark:text-slate-300"
              >
                <span className="font-medium">Round {i + 1}</span>
                <span className={result.winner ? "text-green-500" : "text-stone-400 dark:text-slate-500"}>
                  {result.winner ? `${playerName(result.winner)} won` : "Draw"}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
