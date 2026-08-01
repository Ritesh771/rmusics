let lastSeekTick = 0;

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Haptics are optional and unsupported on some browsers, including iOS Safari.
  }
}

export function seekTouchHaptic() {
  vibrate(6);
}

export function seekDragHaptic(value: number) {
  const tick = Math.floor(value / 5);
  if (tick === lastSeekTick) return;
  lastSeekTick = tick;
  vibrate(4);
}

export function seekCommitHaptic() {
  vibrate(10);
}