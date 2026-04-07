import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import ThemeToggle from "./ThemeToggle";

const BEST_OF_OPTIONS = [1, 3, 5, 7];

export default function GameSetup() {
  const { state, dispatch, navigate } = useGame();
  const { config, mode } = state;

  function update(key, value) {
    dispatch({ type: "UPDATE_CONFIG", payload: { [key]: value } });
  }

  function startGame() {
    dispatch({ type: "START_GAME" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("landing")}
            className="text-stone-500 dark:text-slate-400 hover:text-stone-700
              dark:hover:text-slate-200 text-sm flex items-center gap-1"
          >
            ← Back
          </motion.button>
          <ThemeToggle />
        </div>

        <h2 className="text-3xl font-bold text-stone-800 dark:text-slate-100">
          Game Setup
        </h2>

        <div className="space-y-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm
          rounded-2xl p-6 border border-white/30 dark:border-white/10">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">
                {mode === "computer" ? "Your Name" : "Player 1"}
              </label>
              <input
                type="text"
                value={config.player1Name}
                onChange={(e) => update("player1Name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800
                  border border-stone-200 dark:border-slate-600
                  text-stone-800 dark:text-slate-100 text-sm
                  focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={config.player1Color}
                  onChange={(e) => update("player1Color", e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-stone-400 dark:text-slate-500">Disc color</span>
              </div>
            </div>

            {mode !== "computer" ? (
              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">
                  Player 2
                </label>
                <input
                  type="text"
                  value={config.player2Name}
                  onChange={(e) => update("player2Name", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800
                    border border-stone-200 dark:border-slate-600
                    text-stone-800 dark:text-slate-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={config.player2Color}
                    onChange={(e) => update("player2Color", e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs text-stone-400 dark:text-slate-500">Disc color</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center
                bg-stone-50 dark:bg-slate-800/50 rounded-lg p-4">
                <span className="text-2xl">🤖</span>
                <span className="text-sm text-stone-500 dark:text-slate-400 mt-1">Computer</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
              Board Size: {config.rows} × {config.cols}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-stone-400 dark:text-slate-500">Rows</span>
                <input
                  type="range" min="4" max="10" value={config.rows}
                  onChange={(e) => update("rows", parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div>
                <span className="text-xs text-stone-400 dark:text-slate-500">Columns</span>
                <input
                  type="range" min="4" max="12" value={config.cols}
                  onChange={(e) => update("cols", parseInt(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
              Connect {config.connectN} to win
            </label>
            <input
              type="range" min="3" max={Math.min(config.rows, config.cols)}
              value={config.connectN}
              onChange={(e) => update("connectN", parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
              Series
            </label>
            <div className="flex gap-2">
              {BEST_OF_OPTIONS.map((n) => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update("bestOf", n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                    ${config.bestOf === n
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300"
                    }`}
                >
                  {n === 1 ? "Single" : `Best of ${n}`}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <div className="grid gap-[2px] opacity-40"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, 12px)`,
              }}
            >
              {Array.from({ length: config.rows * config.cols }, (_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-stone-300 dark:bg-slate-600" />
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={startGame}
          className="w-full py-3 rounded-xl text-white font-bold text-lg
            bg-gradient-to-r from-red-500 to-yellow-500
            shadow-lg shadow-red-500/25"
        >
          Start Game
        </motion.button>
      </div>
    </motion.div>
  );
}
