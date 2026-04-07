import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
        bg-white/10 dark:bg-white/5 backdrop-blur-sm
        border border-white/20 dark:border-white/10
        text-stone-600 dark:text-slate-300 text-sm sm:text-lg shrink-0"
      aria-label="Toggle theme"
    >
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {dark ? "🌙" : "☀️"}
      </motion.span>
    </motion.button>
  );
}
