import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Headphones,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Check,
  Radio,
  Loader2,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hook";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Sonara" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const err = params.get("error_description") || hashParams.get("error_description");
      if (err) {
        toast.error(decodeURIComponent(err.replace(/\+/g, " ")));
      }
    }
  }, []);

  if (!loading && user) return <Navigate to="/" />;

  const signInWithGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message ?? "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#faf8ff] via-[#f5f3ff] to-[#ede9fe] text-zinc-900 flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-violet-600 selection:text-white relative overflow-hidden">
      {/* Dynamic Ambient Background Glows in Sonara Neon Violet & Amethyst */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-violet-400/25 rounded-full blur-[140px] pointer-events-none mood-blob" />
      <div className="fixed -bottom-24 -right-24 w-[540px] h-[540px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none mood-blob mood-blob-delay" />
      <div className="fixed top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-300/25 rounded-full blur-[130px] pointer-events-none mood-blob mood-blob-delay-2" />

      {/* Subtle Dot Mesh Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(#8b5cf6 0.75px, transparent 0.75px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Split Card Container */}
      <div className="relative w-full max-w-6xl min-h-[640px] lg:h-[720px] bg-white/90 backdrop-blur-2xl rounded-[28px] md:rounded-[36px] border border-violet-100/90 shadow-[0_25px_70px_rgba(109,40,217,0.08),0_10px_25px_rgba(15,23,42,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Animated Sonara-Themed Music Showcase       */}
        {/* ======================================================== */}
        <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-indigo-50/40 select-none border-r border-violet-100">
          
          {/* Atmospheric Concert Photography with High-Key Light Blending */}
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop"
            alt="Concert stage lights"
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply scale-105 hover:scale-110 transition-transform duration-10000 ease-out"
          />

          {/* Luminous Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/70" />

          {/* Animated floating musical notes in Sonara Theme */}
          <div className="absolute top-1/4 left-14 text-violet-500/50 pointer-events-none animate-float-note-1 text-2xl select-none">
            ♪
          </div>
          <div className="absolute bottom-1/3 right-20 text-purple-500/50 pointer-events-none animate-float-note-2 text-3xl select-none">
            ♫
          </div>
          <div className="absolute top-1/2 right-12 text-indigo-400/50 pointer-events-none animate-float-note-3 text-xl select-none">
            ♬
          </div>

          {/* Corner glowing spheres */}
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-400/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-[80px] pointer-events-none" />

          {/* 1. Header with Sonara Brand & Live Indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3 backdrop-blur-xl bg-white/85 border border-fuchsia-100/90 px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition-all">
              <img
                src="/sonara-icon.png"
                alt="Sonara Logo"
                className="h-9 w-9 rounded-full object-contain shadow-sm shadow-fuchsia-500/20"
              />
              <div>
                <span className="font-extrabold tracking-tight text-zinc-900 text-base leading-none block">
                  Sonara
                </span>
                <span className="text-[10px] font-semibold text-fuchsia-600 tracking-wider uppercase block mt-0.5">
                  Music Beyond Boundaries
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 backdrop-blur-md bg-white/80 border border-violet-100/90 px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
              </span>
              <span className="text-[11px] font-bold tracking-wider text-violet-800 uppercase">
                Live Streaming
              </span>
            </div>
          </div>

          {/* 2. Middle: Interactive Sonara "Now Playing" Music Widget */}
          <div className="relative z-10 my-auto py-6">
            <div className="max-w-md backdrop-blur-2xl bg-white/85 border border-violet-100/90 rounded-2xl p-5 shadow-[0_20px_45px_rgba(109,40,217,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_55px_rgba(109,40,217,0.12)] transition-all duration-300 group">
              <div className="flex items-center gap-4">
                
                {/* Album Cover with Interactive Vinyl Slide-Out Effect */}
                <div className="relative flex-shrink-0 flex items-center">
                  {/* Rotating Vinyl Record peaking out */}
                  <div
                    className={`absolute left-3 w-16 h-16 rounded-full bg-zinc-950 border border-zinc-700/80 shadow-md flex items-center justify-center transition-transform duration-500 ease-out group-hover:translate-x-5 ${
                      isPlaying ? "animate-vinyl" : ""
                    }`}
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #222 25%, #111 26%, #111 40%, #1e1e1e 41%, #111 60%, #181818 61%, #090909 85%)",
                    }}
                  >
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 border border-violet-300 flex items-center justify-center shadow-inner">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
                    </div>
                  </div>

                  {/* Album Artwork Card */}
                  <div className="relative h-18 w-18 rounded-xl overflow-hidden shadow-md bg-zinc-900 border border-violet-200/60 z-10 group-hover:scale-102 transition-transform">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop"
                      alt="Album Artwork"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? "Pause music preview" : "Play music preview"}
                      className="absolute inset-0 bg-black/25 hover:bg-black/35 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 hover:scale-105 text-white flex items-center justify-center shadow-md transition-transform">
                        {isPlaying ? (
                          <Pause className="h-4 w-4 fill-white text-white" />
                        ) : (
                          <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0 pl-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200/80">
                      Now Trending
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500">Global Top 50</span>
                  </div>
                  <h4 className="font-extrabold text-zinc-900 text-base truncate mt-1">Aasa Kooda</h4>
                  <p className="text-xs font-medium text-zinc-500 truncate">Sai Abhyankkar • Think Indie</p>
                </div>

                {/* Favorite Toggle & Animated Violet Equalizer Wave Bars */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    aria-label={isLiked ? "Unlike track" : "Like track"}
                    className="p-1.5 rounded-full hover:bg-violet-50 text-zinc-400 hover:text-violet-600 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`h-4 w-4 transition-transform active:scale-125 ${
                        isLiked ? "fill-violet-600 text-violet-600" : ""
                      }`}
                    />
                  </button>

                  <div className="flex items-end gap-1 h-9 px-1">
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-1 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-1.5"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-2 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-2"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-3 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-1"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-4 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-2.5"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-5 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-1.5"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-6 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-2"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-gradient-to-t from-violet-600 to-fuchsia-400 animate-eq-7 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          : "bg-zinc-300 h-1"
                      }`}
                    />
                  </div>
                </div>

              </div>

              {/* Progress Slider Display */}
              <div className="mt-4 pt-3 border-t border-violet-100">
                <div className="w-full bg-violet-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isPlaying
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 w-[65%] shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                        : "bg-zinc-400 w-[65%]"
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 mt-1.5 font-mono">
                  <span>02:18</span>
                  <span className="flex items-center gap-1 text-violet-700 font-sans font-medium">
                    <Volume2 className="h-3 w-3" /> Master Stereo
                  </span>
                  <span>03:36</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bottom Hero Copy & Music Experience Badges */}
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Where sound meets{" "}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  pure emotion.
                </span>
              </h2>
              <p className="text-sm text-zinc-600 mt-2 max-w-lg leading-relaxed">
                Stream over 170+ master tracks, create customized playlists, and enjoy uninterrupted background listening anywhere.
              </p>
            </div>

            {/* Experience Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-violet-100/90 backdrop-blur shadow-xs text-xs font-semibold text-zinc-700 hover:border-violet-300 hover:bg-white transition-all">
                <Headphones className="h-3.5 w-3.5 text-violet-600" />
                <span>Pure Listening Experience</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-violet-100/90 backdrop-blur shadow-xs text-xs font-semibold text-zinc-700 hover:border-violet-300 hover:bg-white transition-all">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Personalized Recommendations</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-violet-100/90 backdrop-blur shadow-xs text-xs font-semibold text-zinc-700 hover:border-violet-300 hover:bg-white transition-all">
                <Radio className="h-3.5 w-3.5 text-indigo-600" />
                <span>Seamless Background Play</span>
              </div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Clean Sonara Premium Sign In Form          */}
        {/* ======================================================== */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white/85 backdrop-blur-xl overflow-y-auto">
          
          {/* Mobile Header (Shown on small screens) */}
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <img
              src="/sonara-icon.png"
              alt="Sonara Logo"
              className="h-10 w-10 rounded-full object-contain shadow-xs border border-fuchsia-200/80"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 block leading-tight">
                Sonara
              </span>
              <span className="text-[11px] text-fuchsia-600 font-semibold tracking-wide uppercase">
                Music Beyond Boundaries
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="my-auto py-4 space-y-6">
            
            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="h-3 w-3 text-violet-600" />
                <span>Premium Music Experience</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Log in to Sonara
              </h1>
              <p className="text-sm font-normal text-zinc-600 mt-2 leading-relaxed">
                Connect your account to access your personal playlists, saved songs, and continuous queue.
              </p>
            </div>

            {/* Primary Google Auth Button */}
            <div className="pt-2 space-y-3.5">
              <Button
                onClick={signInWithGoogle}
                disabled={busy}
                className="w-full h-14 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-base shadow-[0_10px_30px_rgba(124,58,237,0.15)] hover:shadow-[0_14px_35px_rgba(124,58,237,0.25)] hover:scale-[1.01] active:scale-[0.99] gap-3.5 transition-all cursor-pointer border border-violet-950/40"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    <span>Connecting to Google…</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-full p-1.5 flex items-center justify-center shadow-xs">
                      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden className="flex-shrink-0">
                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.6 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.6 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.1 16.3 43.5 24 43.5z"/>
                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.1 5.2c-.4.4 6.7-4.9 6.7-14.9 0-1.2-.1-2.4-.4-3.5z"/>
                      </svg>
                    </div>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              {/* 🔒 Secure OAuth 2.0 authentication Badge */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50/80 border border-violet-200/70 text-[11px] font-medium text-violet-800 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                  <span>Secure OAuth 2.0 authentication</span>
                </span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="pt-4 border-t border-violet-100 space-y-2.5">
              <div className="flex items-center gap-3 text-xs text-zinc-700">
                <div className="h-5 w-5 rounded-full bg-violet-100 border border-violet-200/70 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-violet-600 stroke-[2.5]" />
                </div>
                <span className="font-medium">Sync playlists and favorite tracks across devices</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-700">
                <div className="h-5 w-5 rounded-full bg-violet-100 border border-violet-200/70 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-violet-600 stroke-[2.5]" />
                </div>
                <span className="font-medium">Lock-screen controls & seamless background playback</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-700">
                <div className="h-5 w-5 rounded-full bg-violet-100 border border-violet-200/70 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-violet-600 stroke-[2.5]" />
                </div>
                <span className="font-medium">Cloud persistent queue and listening history</span>
              </div>
            </div>
          </div>

          {/* Footer - Clean Production App */}
          <div className="pt-6 border-t border-violet-100 space-y-3">
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              By continuing you agree to Sonara{" "}
              <span className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors cursor-pointer underline underline-offset-2">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors cursor-pointer underline underline-offset-2">
                Privacy Policy
              </span>.
            </p>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium text-center">
              <span>© {new Date().getFullYear()} Sonara</span>
              <span>•</span>
              <span>Music Beyond Boundaries</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
