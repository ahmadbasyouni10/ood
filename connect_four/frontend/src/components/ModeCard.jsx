import { motion } from "framer-motion";

const icons = {
  local: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  computer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const descriptions = {
  local: "Two players, one screen",
  computer: "Challenge the AI",
  online: "Play with a friend online",
};

export default function ModeCard({ mode, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 p-8 rounded-2xl
        bg-white/10 dark:bg-white/5 backdrop-blur-sm
        border border-white/20 dark:border-white/10
        text-stone-800 dark:text-slate-100
        cursor-pointer select-none w-full"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 30px rgba(239,68,68,0.2), 0 0 60px rgba(234,179,8,0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="text-red-500 dark:text-red-400">{icons[mode]}</div>
      <span className="text-lg font-bold">{label}</span>
      <span className="text-sm opacity-60">{descriptions[mode]}</span>
    </motion.button>
  );
}
