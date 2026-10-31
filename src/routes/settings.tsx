import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAuth, getDisplayName, getAvatarUrl } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme, toggleTheme } from "@/lib/theme-store";
import { useMood } from "@/lib/mood-store";
import { useShake } from "@/lib/shake-store";
import {
  useEqualizer,
  EQ_FREQUENCIES,
  EQ_LABELS,
  EQ_PRESETS,
} from "@/lib/equalizer-store";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sliders,
  Volume2,
  Palette,
  Sun,
  Moon,
  Smartphone,
  RotateCcw,
  Sparkles,
  LogOut,
  Radio,
  AudioLines,
  Disc,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Sonara — Settings & Equalizer" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  // Equalizer store
  const eqEnabled = useEqualizer((s) => s.enabled);
  const eqPreset = useEqualizer((s) => s.preset);
  const eqGains = useEqualizer((s) => s.gains);
  const setEqEnabled = useEqualizer((s) => s.setEnabled);
  const setEqPreset = useEqualizer((s) => s.setPreset);
  const setEqGain = useEqualizer((s) => s.setGain);
  const resetToFlat = useEqualizer((s) => s.resetToFlat);

  // App preferences
  const theme = useTheme();
  const isDark = theme === "dark";
  const { enabled: moodOn, toggle: toggleMood } = useMood();
  const shakeOn = useShake((s) => s.enabled);
  const shakeSupported = useShake((s) => s.supported);
  const toggleShake = useShake((s) => s.toggle);

  // Playback settings
  const [audioQuality, setAudioQuality] = useState<"normal" | "high" | "master">("master");
  const [crossfadeSec, setCrossfadeSec] = useState(0);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  const name = user ? getDisplayName(user) : "User";
  const avatar = user ? getAvatarUrl(user) : null;
  const initial = (name[0] || "U").toUpperCase();

  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    nav({ to: "/login" });
  };

  // Generate SVG curve points for the 6 equalizer bands (0 to 5)
  // Range: -12dB to +12dB. Width: 600, Height: 200
  const svgPoints = useMemo(() => {
    const w = 600;
    const h = 200;
    const padX = 50;
    const stepX = (w - padX * 2) / 5;

    return eqGains.map((gain, i) => {
      const x = padX + i * stepX;
      // gain in [-12, 12]: +12dB -> y=30, 0dB -> y=100, -12dB -> y=170
      const clampedGain = eqEnabled ? Math.max(-12, Math.min(12, gain)) : 0;
      const y = 100 - (clampedGain / 12) * 70;
      return { x, y, gain, label: EQ_LABELS[i] };
    });
  }, [eqGains, eqEnabled]);

  // Smooth Bezier path string connecting all 6 nodes
  const { pathString, areaString } = useMemo(() => {
    if (!svgPoints.length) return { pathString: "", areaString: "" };

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

    return { pathString: d, areaString: area };
  }, [svgPoints]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure playback frequency response, audio quality, and app preferences.
        </p>
      </div>

      {/* ========================================================= */}
      {/* PLAYBACK EQUALIZER SECTION (Spotify-Standard Reference)   */}
      {/* ========================================================= */}
      <section className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AudioLines className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Playback Equalizer
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Adjust audio frequency response curve in real-time using high-precision Web Audio biquad filters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {eqEnabled ? "Equalizer Active" : "Bypassed"}
            </span>
            <Switch
              checked={eqEnabled}
              onCheckedChange={setEqEnabled}
              aria-label="Toggle Equalizer"
            />
          </div>
        </div>

        {/* Preset Selection Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Equalizer Presets
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToFlat}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset to Flat</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {Object.keys(EQ_PRESETS).map((presetName) => {
              const active = eqPreset === presetName;
              return (
                <button
                  key={presetName}
                  type="button"
                  onClick={() => {
                    setEqPreset(presetName);
                    toast.success(`Equalizer preset set to "${presetName}"`);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]"
                      : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {presetName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Visual Equalizer Frequency Curve Graph (Reference UI) */}
        <div className="bg-background/80 border border-border/70 rounded-2xl p-4 sm:p-6 shadow-inner space-y-4">
          <div className="relative w-full overflow-hidden">
            {/* dB Range Marks */}
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1 pb-2">
              <span>+12 dB</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Frequency Response Curve
              </span>
              <span>-12 dB</span>
            </div>

            {/* SVG Visual Graph Curve */}
            <div className="relative w-full aspect-[3/1] max-h-[220px] bg-card/60 rounded-xl overflow-hidden border border-border/50">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full preserve-3d"
                aria-hidden="true"
              >
                <defs>
                  {/* Subtle Sonara brand vertical gradient fill below curve */}
                  <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
                    <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
                  </linearGradient>

                  <linearGradient id="curveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {/* +12 dB line */}
                <line x1="30" y1="30" x2="570" y2="30" stroke="currentColor" strokeOpacity="0.10" strokeDasharray="4 4" />
                {/* 0 dB Center line */}
                <line x1="30" y1="100" x2="570" y2="100" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
                {/* -12 dB line */}
                <line x1="30" y1="170" x2="570" y2="170" stroke="currentColor" strokeOpacity="0.10" strokeDasharray="4 4" />

                {/* Vertical Frequency divider lines */}
                {svgPoints.map((pt, i) => (
                  <line
                    key={i}
                    x1={pt.x}
                    y1="20"
                    x2={pt.x}
                    y2="180"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                  />
                ))}

                {/* Area under curve */}
                {areaString && (
                  <path d={areaString} fill="url(#eqGradient)" className="transition-all duration-200 ease-out" />
                )}

                {/* Connecting curve line */}
                {pathString && (
                  <path
                    d={pathString}
                    fill="none"
                    stroke="url(#curveStroke)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200 ease-out"
                  />
                )}

                {/* Interactive frequency nodes */}
                {svgPoints.map((pt, i) => (
                  <g key={i} className="transition-transform duration-200">
                    {/* Outer glow ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill="var(--primary)"
                      fillOpacity="0.25"
                      className="animate-pulse"
                    />
                    {/* Solid White node circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#ffffff"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      className="shadow-sm cursor-grab"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* 6 Frequency Band Sliders (60Hz, 150Hz, 400Hz, 1kHz, 2.4kHz, 15kHz) */}
          <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-3">
            {EQ_LABELS.map((label, idx) => {
              const currentGain = eqGains[idx] ?? 0;
              return (
                <div key={label} className="flex flex-col items-center gap-2.5">
                  {/* Gain readout */}
                  <span
                    className={cn(
                      "text-[11px] font-bold tabular-nums",
                      currentGain > 0
                        ? "text-primary"
                        : currentGain < 0
                        ? "text-muted-foreground"
                        : "text-foreground/70"
                    )}
                  >
                    {currentGain > 0 ? `+${currentGain}` : currentGain} dB
                  </span>

                  {/* Vertical-styled Slider */}
                  <div className="h-28 flex items-center justify-center py-1">
                    <Slider
                      orientation="vertical"
                      value={[currentGain]}
                      min={-12}
                      max={12}
                      step={0.5}
                      disabled={!eqEnabled}
                      onValueChange={(val) => {
                        setEqGain(idx, val[0]);
                      }}
                      className="h-full w-5 cursor-pointer"
                    />
                  </div>

                  {/* Frequency Band Label */}
                  <span className="text-xs font-bold text-foreground tracking-tight">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PLAYBACK PREFERENCES SECTION                             */}
      {/* ========================================================= */}
      <section className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="space-y-1 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Audio & Playback Preferences
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Customize streaming quality, volume normalization, and transitions.
          </p>
        </div>

        <div className="space-y-5 divide-y divide-border/50">
          {/* Audio Quality Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Streaming Quality</span>
              <p className="text-xs text-muted-foreground">
                High-bitrate lossless audio streams delivered directly from Cloudflare R2 CDN.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setAudioQuality("normal")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  audioQuality === "normal"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Normal (128k)
              </button>
              <button
                type="button"
                onClick={() => setAudioQuality("high")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  audioQuality === "high"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                High (256k)
              </button>
              <button
                type="button"
                onClick={() => setAudioQuality("master")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer",
                  audioQuality === "master"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Very High (320k Master)
              </button>
            </div>
          </div>

          {/* Volume Normalization */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Normalize Volume</span>
              <p className="text-xs text-muted-foreground">
                Automatically balance volume levels across different album masters and audio formats.
              </p>
            </div>
            <Switch
              checked={normalizeAudio}
              onCheckedChange={setNormalizeAudio}
              aria-label="Normalize volume"
            />
          </div>

          {/* Autoplay Similar Songs */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Autoplay Next Songs</span>
              <p className="text-xs text-muted-foreground">
                Keep the music flowing with related songs when your current queue finishes.
              </p>
            </div>
            <Switch
              checked={autoplay}
              onCheckedChange={setAutoplay}
              aria-label="Autoplay next songs"
            />
          </div>

          {/* Crossfade */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Crossfade Songs</span>
              <span className="text-xs font-bold text-primary tabular-nums">
                {crossfadeSec === 0 ? "Off" : `${crossfadeSec} seconds`}
              </span>
            </div>
            <Slider
              value={[crossfadeSec]}
              min={0}
              max={12}
              step={1}
              onValueChange={(val) => setCrossfadeSec(val[0])}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* APP THEME & EXPERIENCE                                    */}
      {/* ========================================================= */}
      <section className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="space-y-1 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Appearance & Experience
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Personalize theme styling, dynamic ambient backdrops, and mobile interactions.
          </p>
        </div>

        <div className="space-y-5 divide-y divide-border/50">
          {/* Theme Mode Toggle */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                {isDark ? "Dark Theme" : "Light Theme"}
              </span>
              <p className="text-xs text-muted-foreground">
                Switch between clean modern light theme and immersive Spotify dark mode.
              </p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={() => toggleTheme()}
              aria-label="Toggle dark mode"
            />
          </div>

          {/* Mood Lights Backdrop */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Mood Lights Ambient Backdrop
              </span>
              <p className="text-xs text-muted-foreground">
                Extracts dynamic ambient palette from active album artwork for a subtle glow.
              </p>
            </div>
            <Switch
              checked={moodOn}
              onCheckedChange={() => toggleMood()}
              aria-label="Toggle mood lights"
            />
          </div>

          {/* Shake for Volume */}
          {shakeSupported && (
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Shake for Volume
                </span>
                <p className="text-xs text-muted-foreground">
                  Gently tilt or shake your mobile device to increment playback volume.
                </p>
              </div>
              <Switch
                checked={shakeOn}
                onCheckedChange={() => void toggleShake()}
                aria-label="Toggle shake for volume"
              />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* ACCOUNT & PROFILE                                         */}
      {/* ========================================================= */}
      {user && (
        <section className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-1 border-b border-border/50 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Account Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Signed in account details and session control.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border border-border">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-base font-bold text-foreground">{name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={logout}
              className="text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

