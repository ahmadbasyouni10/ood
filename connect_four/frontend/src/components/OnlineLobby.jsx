import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import { useToast } from "./Toast";
import ThemeToggle from "./ThemeToggle";

export default function OnlineLobby() {
  const { state, dispatch, navigate } = useGame();
  const { addToast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("Player");
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: state.config.rows,
          cols: state.config.cols,
          connect_n: state.config.connectN,
        }),
      });
      const data = await res.json();
      dispatch({ type: "UPDATE_CONFIG", payload: { player1Name: playerName } });
      dispatch({ type: "SET_ROOM", code: data.code });
      dispatch({ type: "SET_MY_PIECE", piece: 1 });
      dispatch({ type: "SET_WAITING" });
      dispatch({ type: "START_GAME" });
    } catch {
      addToast("Failed to create room. Is the server running?", "error");
    }
    setLoading(false);
  }

  async function joinRoom() {
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) {
      addToast("Enter a 4-letter room code", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}`);
      const data = await res.json();
      if (data.error) {
        addToast("Room not found", "error");
        setLoading(false);
        return;
      }
      if (data.isFull) {
        addToast("Room is full", "error");
        setLoading(false);
        return;
      }
      dispatch({ type: "SET_ONLINE_CONFIG", config: data.config });
      dispatch({ type: "UPDATE_CONFIG", payload: { player2Name: playerName } });
      dispatch({ type: "SET_ROOM", code });
      dispatch({ type: "SET_MY_PIECE", piece: 2 });
      dispatch({ type: "START_GAME" });
    } catch {
      addToast("Failed to connect. Is the server running?", "error");
    }
    setLoading(false);
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
          Online Play
        </h2>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm
          rounded-2xl p-6 border border-white/30 dark:border-white/10 space-y-5">

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800
                border border-stone-200 dark:border-slate-600
                text-stone-800 dark:text-slate-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRoom}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white
              bg-gradient-to-r from-blue-500 to-cyan-500
              shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create New Room"}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200 dark:bg-slate-700" />
            <span className="text-xs text-stone-400 dark:text-slate-500">or join existing</span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-slate-700" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ABCD"
              maxLength={4}
              className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-800
                border border-stone-200 dark:border-slate-600
                text-stone-800 dark:text-slate-100 text-center
                text-xl font-bold tracking-[0.2em] uppercase
                focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={joinRoom}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-white
                bg-gradient-to-r from-green-500 to-emerald-500
                shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              Join
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
