import { useEffect } from "react";

export function useKeyboard({ onLeft, onRight, onDrop, onUndo, onRestart, onEscape, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    function handleKey(e) {
      const key = e.key.toLowerCase();

      switch (key) {
        case "a":
        case "arrowleft":
          e.preventDefault();
          onLeft?.();
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          onRight?.();
          break;
        case "s":
        case " ":
        case "enter":
          e.preventDefault();
          onDrop?.();
          break;
        case "w":
          e.preventDefault();
          onUndo?.();
          break;
        case "r":
          if (!e.ctrlKey && !e.metaKey) onRestart?.();
          break;
        case "escape":
          onEscape?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onLeft, onRight, onDrop, onUndo, onRestart, onEscape, enabled]);
}
