import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAuth, getDisplayName, getAvatarUrl } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTheme, toggleTheme } from "@/lib/theme-store";
import { useMood } from "@/lib/mood-store";
import { useShake } from "@/lib/shake-store";
import {
  useEqualizer,
  EQ_FREQUENCIES,
  EQ_LABELS,
  EQ_PRESETS,
} from "@/lib/equalizer-store";
import { usePlayer, type RepeatMode } from "@/lib/player-store";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Shield,
  ArrowRight,
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

  // Check if current user is admin
  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

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
  const shuffle = usePlayer((s) => s.shuffle);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const setShuffle = usePlayer((s) => s.setShuffle);
  const repeat = usePlayer((s) => s.repeat);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const setRepeat = usePlayer((s) => s.setRepeat);

  // App & Audio persistent preferences
  const [audioQuality, setAudioQuality] = useState<"normal" | "high" | "master">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sonara_pref_audio_quality") as any) || "master";
    }
    return "master";
  });
  const [crossfadeSec, setCrossfadeSec] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("sonara_pref_crossfade");
      return v ? parseInt(v, 10) : 0;
    }
    return 0;
  });
  const [normalizeAudio, setNormalizeAudio] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("sonara_pref_normalize");
      return v !== null ? v === "true" : true;
    }
    return true;
  });
  const [autoplay, setAutoplay] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("sonara_pref_autoplay");
      return v !== null ? v === "true" : true;
    }
    return true;
  });

  const updateAudioQuality = (q: "normal" | "high" | "master") => {
    setAudioQuality(q);
    if (typeof window !== "undefined") localStorage.setItem("sonara_pref_audio_quality", q);
    toast.success(`Streaming quality set to ${q === "master" ? "Very High (320k)" : q === "high" ? "High (256k)" : "Normal (128k)"}`);
  };

  const updateNormalize = (checked: boolean) => {
    setNormalizeAudio(checked);
    if (typeof window !== "undefined") localStorage.setItem("sonara_pref_normalize", String(checked));
    toast.success(`Volume normalization ${checked ? "enabled" : "disabled"}`);
  };

  const updateAutoplay = (checked: boolean) => {
    setAutoplay(checked);
    if (typeof window !== "undefined") localStorage.setItem("sonara_pref_autoplay", String(checked));
    toast.success(`Autoplay next songs ${checked ? "enabled" : "disabled"}`);
  };

  const updateCrossfade = (val: number) => {
    setCrossfadeSec(val);
    if (typeof window !== "undefined") localStorage.setItem("sonara_pref_crossfade", String(val));
  };

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

        {/* Equalizer Preset Dropdown & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Preset:
            </label>
            <Select
              value={eqPreset}
              onValueChange={(val) => {
                setEqPreset(val);
                toast.success(`Equalizer preset set to "${val}"`);
              }}
            >
              <SelectTrigger className="w-[180px] sm:w-[220px] h-9 text-xs font-semibold bg-background/80 border-border/80">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover/95 backdrop-blur-md">
                {Object.keys(EQ_PRESETS).map((presetName) => (
                  <SelectItem
                    key={presetName}
                    value={presetName}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {presetName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetToFlat}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Flat</span>
          </Button>
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
          {/* Shuffle Mode */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Shuffle Playback</span>
              <p className="text-xs text-muted-foreground">
                Randomize the track order when playing queues and playlists.
              </p>
            </div>
            <Switch
              checked={shuffle}
              onCheckedChange={toggleShuffle}
              aria-label="Toggle Shuffle"
            />
          </div>

          {/* Repeat Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Repeat Mode</span>
              <p className="text-xs text-muted-foreground">
                Choose between playing continuously, looping the full queue, or repeating the single track.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setRepeat("off")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  repeat === "off"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Off
              </button>
              <button
                type="button"
                onClick={() => setRepeat("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  repeat === "all"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Repeat All
              </button>
              <button
                type="button"
                onClick={() => setRepeat("one")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  repeat === "one"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Repeat One (1)
              </button>
            </div>
          </div>

          {/* Audio Quality Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">Streaming Quality</span>
              <p className="text-xs text-muted-foreground">
                High-bitrate lossless audio streams delivered directly from Cloudflare R2 CDN.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => updateAudioQuality("normal")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  audioQuality === "normal"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Normal (128k)
              </button>
              <button
                type="button"
                onClick={() => updateAudioQuality("high")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
                  audioQuality === "high"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                High (256k)
              </button>
              <button
                type="button"
                onClick={() => updateAudioQuality("master")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer",
                  audioQuality === "master"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
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
              onCheckedChange={updateNormalize}
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
              onCheckedChange={updateAutoplay}
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
              onValueChange={(val) => updateCrossfade(val[0])}
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

      {/* ========================================================= */}
      {/* ADMIN & MANAGEMENT (Visible only to Admins)              */}
      {/* ========================================================= */}
      {isAdmin && (
        <section className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Administration Panel
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Direct access for authorized administrators to upload, curate, edit metadata, and manage platform audio tracks.
              </p>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="gap-2 text-xs font-semibold hover:border-primary cursor-pointer w-full sm:w-auto">
                <Shield className="h-4 w-4 text-primary" />
                <span>Open Admin Panel</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* LEGAL & PRIVACY CONTROLS                                  */}
      {/* ========================================================= */}
      <section className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="space-y-1 border-b border-border/50 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Legal & Data Controls
          </h2>
          <p className="text-xs text-muted-foreground">
            Privacy policies, terms of service, and user data management.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <Link
            to="/privacy"
            className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground flex flex-col justify-between space-y-2 transition"
          >
            <span>Privacy Policy</span>
            <span className="text-[10px] text-muted-foreground">How data is protected →</span>
          </Link>
          <Link
            to="/terms"
            className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground flex flex-col justify-between space-y-2 transition"
          >
            <span>Terms of Service</span>
            <span className="text-[10px] text-muted-foreground">Rules & guidelines →</span>
          </Link>
          <Link
            to="/cookies"
            className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground flex flex-col justify-between space-y-2 transition"
          >
            <span>Cookie Policy</span>
            <span className="text-[10px] text-muted-foreground">Local storage use →</span>
          </Link>
          <Link
            to="/data-deletion"
            className="p-3.5 rounded-xl bg-destructive/10 hover:bg-destructive/15 border border-destructive/30 text-xs font-semibold text-destructive flex flex-col justify-between space-y-2 transition"
          >
            <span>Data Controls</span>
            <span className="text-[10px] text-destructive/80">Delete or clear data →</span>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>© 2026 Sonara — Music Beyond Boundaries</span>
          <span className="text-[11px] text-muted-foreground/80">By using Sonara you agree to our Terms and Privacy Policy.</span>
        </div>
      </section>
    </div>
  );
}

