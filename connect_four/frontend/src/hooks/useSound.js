import { useCallback, useState } from "react";
import { playDrop, playWin, playDraw, playClick } from "../utils/sounds";

export function useSound() {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem("sound");
    return saved !== "false";
  });

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      localStorage.setItem("sound", !prev ? "true" : "false");
      return !prev;
    });
  }, []);

  const drop = useCallback(() => enabled && playDrop(), [enabled]);
  const win = useCallback(() => enabled && playWin(), [enabled]);
  const draw = useCallback(() => enabled && playDraw(), [enabled]);
  const click = useCallback(() => enabled && playClick(), [enabled]);

  return { enabled, toggle, drop, win, draw, click };
}
