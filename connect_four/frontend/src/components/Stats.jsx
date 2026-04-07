import { motion } from "framer-motion";
import { getAllStats, clearStats } from "../utils/stats";
import { useGame } from "../contexts/GameContext";
import ThemeToggle from "./ThemeToggle";

export default function Stats() {
  const { navigate } = useGame();
  const stats = getAllStats();
  const players = Object.entries(stats.players);

  function handleClear() {
    clearStats();
    navigate("landing");
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
            className="text-stone-500 dark:text-slate-400 text-sm"
          >
            ← Back
          </motion.button>
          <ThemeToggle />
        </div>

        <h2 className="text-3xl font-bold text-stone-800 dark:text-slate-100">
          All-Time Stats
        </h2>

        <div className="text-sm text-stone-500 dark:text-slate-400">
          {stats.totalGames} game{stats.totalGames !== 1 ? "s" : ""} played
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12 text-stone-400 dark:text-slate-500">
            No games played yet. Go play!
          </div>
        ) : (
          <div className="space-y-4">
            {players.map(([name, p]) => {
              const winRate = p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
              const avgMoves = p.gamesPlayed > 0 ? Math.round(p.totalMoves / p.gamesPlayed) : 0;

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-sm
                    rounded-2xl p-5 border border-white/30 dark:border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-slate-100">{name}</span>
                    <span className="text-sm text-stone-400 dark:text-slate-500">
                      {p.gamesPlayed} game{p.gamesPlayed !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-stone-100 dark:bg-slate-700">
                    {p.wins > 0 && (
                      <div
                        className="bg-green-500 rounded-l-full transition-all"
                        style={{ width: `${(p.wins / p.gamesPlayed) * 100}%` }}
                      />
                    )}
                    {p.draws > 0 && (
                      <div
                        className="bg-yellow-500 transition-all"
                        style={{ width: `${(p.draws / p.gamesPlayed) * 100}%` }}
                      />
                    )}
                    {p.losses > 0 && (
                      <div
                        className="bg-red-500 rounded-r-full transition-all"
                        style={{ width: `${(p.losses / p.gamesPlayed) * 100}%` }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-stone-500 dark:text-slate-400">
                    <span className="text-green-500">{p.wins}W</span>
                    <span className="text-yellow-500">{p.draws}D</span>
                    <span className="text-red-500">{p.losses}L</span>
                    <span className="font-medium text-stone-600 dark:text-slate-300">{winRate}% win rate</span>
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs border-t
                    border-stone-100 dark:border-slate-700 pt-3 gap-2">
                    <div>
                      <div className="font-bold text-stone-700 dark:text-slate-200">{p.bestStreak}</div>
                      <div className="text-stone-400 dark:text-slate-500">Win Streak</div>
                    </div>
                    <div>
                      <div className="font-bold text-stone-700 dark:text-slate-200">
                        {p.fastestWin !== null ? `${p.fastestWin}` : "—"}
                      </div>
                      <div className="text-stone-400 dark:text-slate-500">Best Win</div>
                      {p.fastestWin !== null && (
                        <div className="text-stone-300 dark:text-slate-600 text-[10px]">moves</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-stone-700 dark:text-slate-200">
                        {avgMoves > 0 ? avgMoves : "—"}
                      </div>
                      <div className="text-stone-400 dark:text-slate-500">Avg Game</div>
                      {avgMoves > 0 && (
                        <div className="text-stone-300 dark:text-slate-600 text-[10px]">moves</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {players.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClear}
            className="w-full py-2.5 rounded-xl text-sm font-medium
              bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            Clear All Stats
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
