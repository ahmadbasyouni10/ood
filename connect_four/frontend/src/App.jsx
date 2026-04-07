import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider, useGame } from "./contexts/GameContext";
import { ToastProvider } from "./components/Toast";
import Landing from "./components/Landing";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import OnlineLobby from "./components/OnlineLobby";
import Stats from "./components/Stats";

function Router() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={state.screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {state.screen === "landing" && <Landing />}
        {state.screen === "setup" && <GameSetup />}
        {state.screen === "game" && <GameBoard />}
        {state.screen === "online-lobby" && <OnlineLobby />}
        {state.screen === "stats" && <Stats />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <ToastProvider>
          <div className="min-h-screen bg-amber-50 dark:bg-slate-900 transition-colors duration-500">
            <Router />
          </div>
        </ToastProvider>
      </GameProvider>
    </ThemeProvider>
  );
}
