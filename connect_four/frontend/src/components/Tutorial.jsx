import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TUTORIAL_KEY = "connect4_tutorial_done";

export default function Tutorial() {
  const [show, setShow] = useState(() => !localStorage.getItem(TUTORIAL_KEY));

  useEffect(() => {
    if (!show) return;
    function dismiss() {
      setShow(false);
      localStorage.setItem(TUTORIAL_KEY, "1");
    }
    window.addEventListener("click", dismiss, { once: true });
    return () => window.removeEventListener("click", dismiss);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-40
            bg-black/80 text-white text-sm px-4 py-2 rounded-xl
            flex items-center gap-2 whitespace-nowrap"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            👇
          </motion.span>
          Click a column to drop your piece
        </motion.div>
      )}
    </AnimatePresence>
  );
}
