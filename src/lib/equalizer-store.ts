import { create } from "zustand";

export interface EqualizerPreset {
  name: string;
  gains: [number, number, number, number, number, number];
}

export const EQ_FREQUENCIES = [60, 150, 400, 1000, 2400, 15000] as const;
export const EQ_LABELS = ["60Hz", "150Hz", "400Hz", "1kHz", "2.4kHz", "15kHz"] as const;

export const EQ_PRESETS: Record<string, [number, number, number, number, number, number]> = {
  Flat: [0, 0, 0, 0, 0, 0],
  "Bass Booster": [9, 7, 2, 0, -2, -3],
  "Bass Reducer": [-8, -6, -2, 0, 2, 3],
  Rock: [7, 4, -1, 2, 5, 7],
  Pop: [-1, 3, 5, 4, 2, -1],
  "Hip-Hop": [9, 6, 0, 3, 2, 4],
  Electronic: [6, 4, 0, 3, 6, 7],
  Jazz: [4, 3, 2, 3, 2, 4],
  Classical: [5, 3, 2, 2, 4, 5],
  "Vocal Booster": [-3, -1, 4, 7, 4, 0],
  Acoustic: [4, 3, 2, 3, 4, 3],
  Deep: [8, 5, 2, 0, -2, -5],
  "Treble Booster": [-4, -2, 0, 4, 6, 9],
  "R&B": [6, 7, 3, -1, 3, 4],
};

interface EqualizerState {
  enabled: boolean;
  preset: string;
  gains: [number, number, number, number, number, number];
  setEnabled: (enabled: boolean) => void;
  setPreset: (presetName: string) => void;
  setGain: (bandIndex: number, gain: number) => void;
  setAllGains: (gains: [number, number, number, number, number, number]) => void;
  resetToFlat: () => void;
}

// Module-level Web Audio API singletons
let audioCtx: AudioContext | null = null;
let mediaSourceNode: MediaElementAudioSourceNode | null = null;
let biquadFilters: BiquadFilterNode[] = [];
let boundAudioEl: HTMLAudioElement | null = null;

function applyFilterGains(gains: [number, number, number, number, number, number], enabled: boolean) {
  if (!biquadFilters.length || !audioCtx) return;
  const now = audioCtx.currentTime;
  biquadFilters.forEach((filter, idx) => {
    // Clamp gains between -12dB and +12dB to guarantee Web Audio API safety
    const raw = gains[idx] ?? 0;
    const clamped = Math.max(-12, Math.min(12, raw));
    const targetGain = enabled ? clamped : 0;
    try {
      filter.gain.cancelScheduledValues(now);
      filter.gain.setTargetAtTime(targetGain, now, 0.03);
    } catch {
      filter.gain.value = targetGain;
    }
  });
}

export function attachEqualizerToAudio(audioElement: HTMLAudioElement) {
  if (typeof window === "undefined") return;
  if (boundAudioEl === audioElement && biquadFilters.length === 6) {
    const st = useEqualizer.getState();
    applyFilterGains(st.gains, st.enabled);
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (!mediaSourceNode || boundAudioEl !== audioElement) {
      try {
        mediaSourceNode = audioCtx.createMediaElementSource(audioElement);
      } catch (err) {
        // Element might already be hooked
        console.warn("[Equalizer] createMediaElementSource note:", err);
      }
    }

    if (mediaSourceNode && biquadFilters.length === 0) {
      biquadFilters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = audioCtx!.createBiquadFilter();
        if (index === 0) {
          filter.type = "lowshelf";
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        return filter;
      });

      // Chain: source -> f0 -> f1 -> f2 -> f3 -> f4 -> f5 -> destination
      let current: AudioNode = mediaSourceNode;
      for (const filter of biquadFilters) {
        current.connect(filter);
        current = filter;
      }
      current.connect(audioCtx.destination);
    }

    boundAudioEl = audioElement;
    const st = useEqualizer.getState();
    applyFilterGains(st.gains, st.enabled);
  } catch (err) {
    console.error("[Equalizer] Setup error:", err);
  }
}

export function resumeAudioContext() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const st = useEqualizer.getState();
    applyFilterGains(st.gains, st.enabled);
  }
}

// Re-arm AudioContext when returning from background / screen unlock if user enabled EQ
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  });
}

// Persist in localStorage
const STORAGE_KEY = "sonara_eq_settings_v1";

function loadSavedSettings(): {
  enabled: boolean;
  preset: string;
  gains: [number, number, number, number, number, number];
} {
  if (typeof window === "undefined") {
    return { enabled: false, preset: "Rock", gains: EQ_PRESETS.Rock };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.gains) && parsed.gains.length === 6) {
        return {
          enabled: parsed.enabled ?? false,
          preset: parsed.preset ?? "Rock",
          gains: parsed.gains,
        };
      }
    }
  } catch {}
  return { enabled: false, preset: "Rock", gains: EQ_PRESETS.Rock };
}

const initial = loadSavedSettings();

export const useEqualizer = create<EqualizerState>((set, get) => ({
  enabled: initial.enabled,
  preset: initial.preset,
  gains: initial.gains,

  setEnabled: (enabled) => {
    set({ enabled });
    if (enabled && boundAudioEl) {
      attachEqualizerToAudio(boundAudioEl);
    }
    applyFilterGains(get().gains, enabled);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...get(), enabled }));
    } catch {}
  },

  setPreset: (presetName) => {
    const presetGains = EQ_PRESETS[presetName] || EQ_PRESETS.Flat;
    set({ preset: presetName, gains: [...presetGains] as [number, number, number, number, number, number] });
    applyFilterGains(presetGains, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...get(), preset: presetName, gains: presetGains })
      );
    } catch {}
  },

  setGain: (bandIndex, gain) => {
    const newGains = [...get().gains] as [number, number, number, number, number, number];
    newGains[bandIndex] = Math.max(-12, Math.min(12, Math.round(gain * 10) / 10));

    // Determine if matches a known preset
    let matchingPreset = "Custom";
    for (const [name, pGains] of Object.entries(EQ_PRESETS)) {
      if (pGains.every((g, i) => Math.abs(g - newGains[i]) < 0.1)) {
        matchingPreset = name;
        break;
      }
    }

    set({ gains: newGains, preset: matchingPreset });
    applyFilterGains(newGains, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...get(), gains: newGains, preset: matchingPreset })
      );
    } catch {}
  },

  setAllGains: (gains) => {
    set({ gains: [...gains] as [number, number, number, number, number, number] });
    applyFilterGains(gains, get().enabled);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...get(), gains }));
    } catch {}
  },

  resetToFlat: () => {
    const flat = EQ_PRESETS.Flat;
    set({ preset: "Flat", gains: [...flat] as [number, number, number, number, number, number] });
    applyFilterGains(flat, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...get(), preset: "Flat", gains: flat })
      );
    } catch {}
  },
}));

