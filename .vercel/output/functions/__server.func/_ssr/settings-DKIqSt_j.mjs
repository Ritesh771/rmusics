import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { z as useAuth, C as useEqualizer, K as useTheme, F as useMood, J as useShake, w as getDisplayName, v as getAvatarUrl, E as EQ_LABELS, r as Switch, B as Button, p as EQ_PRESETS, t as cn, S as Slider, y as toggleTheme, A as Avatar, b as AvatarImage, a as AvatarFallback } from "./router-SYh-4Vc5.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { b as AudioLines, Q as RotateCcw, a4 as Volume2, P as Palette, x as Moon, _ as Sun, Z as Smartphone, u as LogOut } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "./song-utils-CWgDAApr.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/radix-ui__react-slider.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/zustand.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function SettingsPage() {
  const {
    user
  } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const eqEnabled = useEqualizer((s) => s.enabled);
  const eqPreset = useEqualizer((s) => s.preset);
  const eqGains = useEqualizer((s) => s.gains);
  const setEqEnabled = useEqualizer((s) => s.setEnabled);
  const setEqPreset = useEqualizer((s) => s.setPreset);
  const setEqGain = useEqualizer((s) => s.setGain);
  const resetToFlat = useEqualizer((s) => s.resetToFlat);
  const theme = useTheme();
  const isDark = theme === "dark";
  const {
    enabled: moodOn,
    toggle: toggleMood
  } = useMood();
  const shakeOn = useShake((s) => s.enabled);
  const shakeSupported = useShake((s) => s.supported);
  const toggleShake = useShake((s) => s.toggle);
  const [audioQuality, setAudioQuality] = reactExports.useState("master");
  const [crossfadeSec, setCrossfadeSec] = reactExports.useState(0);
  const [normalizeAudio, setNormalizeAudio] = reactExports.useState(true);
  const [autoplay, setAutoplay] = reactExports.useState(true);
  const name = user ? getDisplayName(user) : "User";
  const avatar = user ? getAvatarUrl(user) : null;
  const initial = (name[0] || "U").toUpperCase();
  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    nav({
      to: "/login"
    });
  };
  const svgPoints = reactExports.useMemo(() => {
    const w = 600;
    const padX = 50;
    const stepX = (w - padX * 2) / 5;
    return eqGains.map((gain, i) => {
      const x = padX + i * stepX;
      const clampedGain = eqEnabled ? Math.max(-12, Math.min(12, gain)) : 0;
      const y = 100 - clampedGain / 12 * 70;
      return {
        x,
        y,
        gain,
        label: EQ_LABELS[i]
      };
    });
  }, [eqGains, eqEnabled]);
  const {
    pathString,
    areaString
  } = reactExports.useMemo(() => {
    if (!svgPoints.length) return {
      pathString: "",
      areaString: ""
    };
    let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p0 = svgPoints[i];
      const p1 = svgPoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    const last = svgPoints[svgPoints.length - 1];
    const first = svgPoints[0];
    const area = `${d} L ${last.x} 190 L ${first.x} 190 Z`;
    return {
      pathString: d,
      areaString: area
    };
  }, [svgPoints]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Configure playback frequency response, audio quality, and app preferences." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AudioLines, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: "Playback Equalizer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Adjust audio frequency response curve in real-time using high-precision Web Audio biquad filters." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: eqEnabled ? "Equalizer Active" : "Bypassed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: eqEnabled, onCheckedChange: setEqEnabled, "aria-label": "Toggle Equalizer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Equalizer Presets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: resetToFlat, className: "h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Reset to Flat" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 pt-1", children: Object.keys(EQ_PRESETS).map((presetName) => {
          const active = eqPreset === presetName;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setEqPreset(presetName);
            toast.success(`Equalizer preset set to "${presetName}"`);
          }, className: cn("px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border", active ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]" : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"), children: presetName }, presetName);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/80 border border-border/70 rounded-2xl p-4 sm:p-6 shadow-inner space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+12 dB" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary uppercase tracking-wider", children: "Frequency Response Curve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "-12 dB" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full aspect-[3/1] max-h-[220px] bg-card/60 rounded-xl overflow-hidden border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 600 200", className: "w-full h-full preserve-3d", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "eqGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--primary)", stopOpacity: "0.38" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "60%", stopColor: "var(--primary)", stopOpacity: "0.12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--primary)", stopOpacity: "0.01" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "curveStroke", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#d946ef" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#8b5cf6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#2563eb" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "30", y1: "30", x2: "570", y2: "30", stroke: "currentColor", strokeOpacity: "0.10", strokeDasharray: "4 4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "30", y1: "100", x2: "570", y2: "100", stroke: "currentColor", strokeOpacity: "0.25", strokeWidth: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "30", y1: "170", x2: "570", y2: "170", stroke: "currentColor", strokeOpacity: "0.10", strokeDasharray: "4 4" }),
            svgPoints.map((pt, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: pt.x, y1: "20", x2: pt.x, y2: "180", stroke: "currentColor", strokeOpacity: "0.12", strokeWidth: "1" }, i)),
            areaString && /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: areaString, fill: "url(#eqGradient)", className: "transition-all duration-200 ease-out" }),
            pathString && /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: pathString, fill: "none", stroke: "url(#curveStroke)", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", className: "transition-all duration-200 ease-out" }),
            svgPoints.map((pt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "transition-transform duration-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: pt.x, cy: pt.y, r: "10", fill: "var(--primary)", fillOpacity: "0.25", className: "animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: pt.x, cy: pt.y, r: "6", fill: "#ffffff", stroke: "var(--primary)", strokeWidth: "2.5", className: "shadow-sm cursor-grab" })
            ] }, i))
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-2 sm:gap-4 pt-3", children: EQ_LABELS.map((label, idx) => {
          const currentGain = eqGains[idx] ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-[11px] font-bold tabular-nums", currentGain > 0 ? "text-primary" : currentGain < 0 ? "text-muted-foreground" : "text-foreground/70"), children: [
              currentGain > 0 ? `+${currentGain}` : currentGain,
              " dB"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 flex items-center justify-center py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { orientation: "vertical", value: [currentGain], min: -12, max: 12, step: 0.5, disabled: !eqEnabled, onValueChange: (val) => {
              setEqGain(idx, val[0]);
            }, className: "h-full w-5 cursor-pointer" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground tracking-tight", children: label })
          ] }, label);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 border-b border-border/50 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: "Audio & Playback Preferences" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Customize streaming quality, volume normalization, and transitions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 divide-y divide-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Streaming Quality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "High-bitrate lossless audio streams delivered directly from Cloudflare R2 CDN." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAudioQuality("normal"), className: cn("px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer", audioQuality === "normal" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"), children: "Normal (128k)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAudioQuality("high"), className: cn("px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer", audioQuality === "high" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"), children: "High (256k)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAudioQuality("master"), className: cn("px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer", audioQuality === "master" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"), children: "Very High (320k Master)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Normalize Volume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically balance volume levels across different album masters and audio formats." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: normalizeAudio, onCheckedChange: setNormalizeAudio, "aria-label": "Normalize volume" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Autoplay Next Songs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Keep the music flowing with related songs when your current queue finishes." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: autoplay, onCheckedChange: setAutoplay, "aria-label": "Autoplay next songs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Crossfade Songs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary tabular-nums", children: crossfadeSec === 0 ? "Off" : `${crossfadeSec} seconds` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { value: [crossfadeSec], min: 0, max: 12, step: 1, onValueChange: (val) => setCrossfadeSec(val[0]), className: "w-full cursor-pointer" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 border-b border-border/50 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: "Appearance & Experience" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Personalize theme styling, dynamic ambient backdrops, and mobile interactions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 divide-y divide-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
              isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 text-primary" }),
              isDark ? "Dark Theme" : "Light Theme"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Switch between clean modern light theme and immersive Spotify dark mode." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isDark, onCheckedChange: () => toggleTheme(), "aria-label": "Toggle dark mode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4 text-primary" }),
              "Mood Lights Ambient Backdrop"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Extracts dynamic ambient palette from active album artwork for a subtle glow." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: moodOn, onCheckedChange: () => toggleMood(), "aria-label": "Toggle mood lights" })
        ] }),
        shakeSupported && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4 text-primary" }),
              "Shake for Volume"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Gently tilt or shake your mobile device to increment playback volume." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: shakeOn, onCheckedChange: () => void toggleShake(), "aria-label": "Toggle shake for volume" })
        ] })
      ] })
    ] }),
    user && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 border-b border-border/50 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-foreground", children: "Account Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Signed in account details and session control." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-12 w-12 border border-border", children: [
            avatar && /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: avatar, alt: name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary text-primary-foreground font-bold text-base", children: initial })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-foreground", children: name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: user.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: logout, className: "text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 cursor-pointer self-start sm:self-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign Out" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
