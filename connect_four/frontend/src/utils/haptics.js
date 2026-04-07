export function vibrateShort() {
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

export function vibrateLong() {
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }
}
