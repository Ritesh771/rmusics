import { create } from "zustand";

export interface EqualizerPreset {
  name: string;
  gains: [number, number, number, number, number, number];
}

export const EQ_FREQUENCIES = [60, 150, 400, 1000, 2400, 15000] as const;
export const EQ_LABELS = ["60Hz", "150Hz", "400Hz", "1kHz", "2.4kHz", "15kHz"] as const;

export const EQ_PRESETS: Record<string, [number, number, number, number, number, number]> = {
  Flat: [0, 0, 0, 0, 0, 0],
  "Bass Booster": [6, 5, 2, 0, -1, -2],
  "Bass Reducer": [-6, -5, -2, 0, 1, 2],
  Rock: [5, 3, -1, 1, 3, 5],
  Pop: [-1, 2, 4, 3, 1, -1],
  "Hip-Hop": [6, 4, 0, 2, 1, 3],
  Electronic: [4, 3, 0, 2, 4, 5],
  Jazz: [3, 2, 1, 2, 1, 3],
  Classical: [4, 3, 2, 2, 3, 4],
  "Vocal Booster": [-2, -1, 3, 5, 3, 0],
  Acoustic: [3, 2, 1, 2, 3, 2],
  Deep: [5, 3, 1, 0, -2, -4],
  "Treble Booster": [-3, -2, 0, 2, 4, 6],
  "R&B": [4, 5, 2, -1, 2, 3],
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
    const targetGain = enabled ? (gains[idx] ?? 0) : 0;
    try {
      filter.gain.setTargetAtTime(targetGain, now, 0.05);
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
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

// Persist in localStorage
const STORAGE_KEY = "sonara_eq_settings_v1";

function loadSavedSettings(): {
  enabled: boolean;
  preset: string;
  gains: [number, number, number, number, number, number];
} {
  if (typeof window === "undefined") {
    return { enabled: true, preset: "Rock", gains: EQ_PRESETS.Rock };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.gains) && parsed.gains.length === 6) {
        return {
          enabled: parsed.enabled ?? true,
          preset: parsed.preset ?? "Rock",
          gains: parsed.gains,
        };
      }
    }
  } catch {}
  return { enabled: true, preset: "Rock", gains: EQ_PRESETS.Rock };
}

const initial = loadSavedSettings();

export const useEqualizer = create<EqualizerState>((set, get) => ({
  enabled: initial.enabled,
  preset: initial.preset,
  gains: initial.gains,

  setEnabled: (enabled) => {
    set({ enabled });
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

