import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import ModeCard from "./ModeCard";
import ParticleBackground from "./ParticleBackground";
import ThemeToggle from "./ThemeToggle";

export default function Landing() {
  const { dispatch, navigate } = useGame();

  function selectMode(mode) {
    dispatch({ type: "SET_MODE", mode });
    if (mode === "online") {
      navigate("online-lobby");
    } else {
      navigate("setup");
    }
  }

  function quickPlay() {
    dispatch({ type: "SET_MODE", mode: "local" });
    dispatch({ type: "START_GAME" });
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <ParticleBackground />

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ThemeToggle />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("stats")}
          className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5
            backdrop-blur-sm border border-white/20 dark:border-white/10
            text-stone-700 dark:text-slate-300 text-sm font-medium"
        >
          Stats
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center gap-8 max-w-lg w-full"
      >
        <div className="text-center">
          <motion.h1
            className="text-6xl sm:text-7xl font-black tracking-tight
              bg-gradient-to-r from-red-500 via-yellow-500 to-red-500
              bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Connect Four
          </motion.h1>
          <p className="mt-2 text-stone-500 dark:text-slate-400 text-lg">
            Drop, connect, win.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <ModeCard mode="local" label="Local" onClick={() => selectMode("local")} />
          <ModeCard mode="computer" label="Computer" onClick={() => selectMode("computer")} />
          <ModeCard mode="online" label="Online" onClick={() => selectMode("online")} />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={quickPlay}
          className="px-6 py-3 rounded-xl text-sm font-medium
            bg-gradient-to-r from-red-500 to-yellow-500
            text-white shadow-lg shadow-red-500/25"
        >
          Quick Play
        </motion.button>
      </motion.div>
    </div>
  );
}
