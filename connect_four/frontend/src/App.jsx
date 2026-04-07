import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider, useGame } from "./contexts/GameContext";
import { ToastProvider } from "./components/Toast";
import Landing from "./components/Landing";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import OnlineLobby from "./components/OnlineLobby";
import Stats from "./components/Stats";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function Router() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.screen}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
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
