import { motion, AnimatePresence } from "framer-motion";

export default function Settings({ open, onClose, soundEnabled, onToggleSound, onForfeit, showForfeit }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-72 z-50
              bg-white dark:bg-slate-800 shadow-2xl p-6
              flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-800 dark:text-slate-100">
                Settings
              </h3>
              <button
                onClick={onClose}
                className="text-stone-400 dark:text-slate-500 hover:text-stone-600
                  dark:hover:text-slate-300 text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 dark:text-slate-300">Sound</span>
              <button
                onClick={onToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative
                  ${soundEnabled ? "bg-green-500" : "bg-stone-300 dark:bg-slate-600"}`}
              >
                <motion.div
                  animate={{ x: soundEnabled ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                />
              </button>
            </div>

            {showForfeit && (
              <button
                onClick={onForfeit}
                className="mt-auto py-2.5 rounded-xl text-sm font-medium
                  bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                Forfeit Game
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
