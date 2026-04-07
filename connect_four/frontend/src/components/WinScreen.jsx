import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import Confetti from "./Confetti";

export default function WinScreen({ onRematch, onMenu }) {
  const { state } = useGame();
  const { gameStatus, winner, config, scores, moveCount } = state;

  if (gameStatus !== "won" && gameStatus !== "draw") return null;

  const isDraw = gameStatus === "draw";
  const winnerName = winner === 1 ? config.player1Name : config.player2Name;
  const winnerColor = winner === 1 ? config.player1Color : config.player2Color;
  const targetScore = Math.ceil(config.bestOf / 2);
  const seriesOver = scores[0] >= targetScore || scores[1] >= targetScore;

  function handleShare() {
    const text = isDraw
      ? `Draw after ${moveCount} moves in Connect ${config.connectN}!`
      : `${winnerName} won in ${moveCount} moves in Connect ${config.connectN}!`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <>
      <Confetti
        active={!isDraw}
        color1={config.player1Color}
        color2={config.player2Color}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-30 flex items-center justify-center p-4
          bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl
            max-w-sm w-full text-center space-y-5"
        >
          {isDraw ? (
            <>
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-5xl"
              >
                🤝
              </motion.div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-100">
                It's a Draw!
              </h2>
            </>
          ) : (
            <>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl"
              >
                👑
              </motion.div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-100">
                <span style={{ color: winnerColor }}>{winnerName}</span> Wins!
              </h2>
            </>
          )}

          <p className="text-sm text-stone-500 dark:text-slate-400">
            {moveCount} moves played
          </p>

          <div className="flex items-center justify-center gap-4 text-lg font-bold">
            <span style={{ color: config.player1Color }}>{scores[0]}</span>
            <span className="text-stone-300 dark:text-slate-600">—</span>
            <span style={{ color: config.player2Color }}>{scores[1]}</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {!seriesOver && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onRematch}
                className="w-full py-3 rounded-xl font-bold text-white
                  bg-gradient-to-r from-red-500 to-yellow-500
                  shadow-lg shadow-red-500/25"
              >
                {config.bestOf > 1 ? "Next Round" : "Rematch"}
              </motion.button>
            )}

            {seriesOver && (
              <div className="text-sm font-medium text-green-500 py-2">
                🏆 {scores[0] >= targetScore ? config.player1Name : config.player2Name} wins the series!
              </div>
            )}

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                  bg-stone-100 dark:bg-slate-700
                  text-stone-600 dark:text-slate-300"
              >
                Share
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onMenu}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                  bg-stone-100 dark:bg-slate-700
                  text-stone-600 dark:text-slate-300"
              >
                Menu
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
