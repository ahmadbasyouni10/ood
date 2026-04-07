import { motion } from "framer-motion";

function darken(hex, amount = 40) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function Piece({ color, isNew, row, isWinning }) {
  return (
    <motion.div
      className="absolute inset-[6%] rounded-full z-20"
      style={{
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%),
                     radial-gradient(circle at 50% 50%, ${color} 50%, ${darken(color)} 100%)`,
        boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.15)`,
      }}
      initial={isNew ? { y: `${-(row + 2) * 120}%`, opacity: 0.9 } : false}
      animate={{
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      transition={
        isNew
          ? {
              y: { type: "spring", stiffness: 350, damping: 22, mass: 1.5 },
              opacity: { duration: 0.1 },
            }
          : { duration: 0 }
      }
    >
      {isNew && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scaleY: [1, 0.88, 1.06, 0.97, 1],
            scaleX: [1, 1.12, 0.94, 1.03, 1],
          }}
          transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
        />
      )}

      {isWinning && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 8px 2px ${color}80`,
              `0 0 24px 8px ${color}cc`,
              `0 0 8px 2px ${color}80`,
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
