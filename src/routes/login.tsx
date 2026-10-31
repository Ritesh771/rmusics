import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Music2,
  Crown,
  Users,
  Laptop,
  Loader2,
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
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);

  // Forgot Password Dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("sonara_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }

      // Handle OAuth error callbacks in URL
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const err = params.get("error_description") || hashParams.get("error_description");
      if (err) {
        toast.error(decodeURIComponent(err.replace(/\+/g, " ")));
      }
    }
  }, []);

  if (!loading && user) return <Navigate to="/" />;

  // Email & Password Auth Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          toast.error(error.message);
          setBusy(false);
          return;
        }

        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("sonara_remembered_email", cleanEmail);
        } else if (typeof window !== "undefined") {
          localStorage.removeItem("sonara_remembered_email");
        }

        toast.success("Signed in successfully!");
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) {
          toast.error(error.message);
          setBusy(false);
          return;
        }

        if (data.session) {
          toast.success("Account created successfully!");
        } else {
          toast.success("Account created! Check your email to confirm registration.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  // Google OAuth Handler
  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message ?? "Google sign-in failed");
        setBusy(false);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "An error occurred during authentication");
      setBusy(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setForgotBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/settings`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset instructions sent to your email.");
        setForgotOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send reset email");
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080711] text-white flex flex-col justify-between font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC CLEAN BACKGROUND WALLPAPER                                   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/sonara-login-bg.jpg"
          alt="Sonara Atmosphere"
          className="absolute inset-0 w-full h-full object-cover object-[25%_center] lg:object-center scale-[1.02]"
        />

        {/* Ambient Dark Gradient Vignette for Razor-Sharp Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080711]/90 via-[#080711]/60 to-[#080711]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080711] via-transparent to-[#080711]/80" />

        {/* Dynamic Glow Accents in Sonara Brand Shades */}
        <div className="fixed -top-32 -left-32 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[160px]" />
        <div className="fixed -bottom-32 -right-32 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[170px]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP NAVBAR (Hidden on small mobile to maximize clean focus)            */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 hidden lg:flex items-center justify-between">
        {/* Left: Brand Icon & Wordmark */}
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.5)] flex-shrink-0">
            <div className="h-full w-full rounded-full bg-[#0d0b1a] flex items-center justify-center overflow-hidden">
              <img
                src="/sonara-icon.png"
                alt="Sonara Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-widest text-white block uppercase leading-none">
              SONARA
            </span>
            <span className="text-[10px] tracking-[0.25em] font-semibold text-zinc-400 uppercase block mt-1">
              MUSIC BEYOND BOUNDARIES.
            </span>
          </div>
        </div>

        {/* Right: Navigation Links & Toggle */}
        <nav className="flex items-center gap-7">
          <div className="flex items-center gap-7 text-xs font-semibold text-zinc-300">
            <span className="hover:text-white transition-colors cursor-pointer">Discover</span>
            <span className="hover:text-white transition-colors cursor-pointer">Premium</span>
            <span className="hover:text-white transition-colors cursor-pointer">Download</span>
            <span className="hover:text-white transition-colors cursor-pointer">Support</span>
          </div>

          <button
            onClick={() => setAuthMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="text-xs font-bold tracking-wider text-white px-5 py-2 rounded-full border border-purple-500/60 bg-purple-950/40 hover:bg-purple-600/30 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
          >
            {authMode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: Desktop 2-Column | Mobile shows ONLY the Login Box       */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* ---------------- LEFT SECTION: Hidden on Mobile, Shown on Desktop ------ */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-7 select-none pr-4">
          {/* Large Headline */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              Your World.
            </h1>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(217,70,239,0.3)]">
              Your Sound.
            </h1>
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-300/90 max-w-lg leading-relaxed font-normal">
            Stream millions of songs, discover personalized playlists, and experience music without limits.
          </p>

          {/* Four Professional Value Pillars */}
          <div className="space-y-3.5 pt-2 max-w-md">
            {/* 1. Millions of Songs */}
            <div className="flex items-center gap-4 group">
              <div className="h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors">
                <Music2 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Millions of Songs</h4>
                <p className="text-xs text-zinc-400 font-normal mt-0.5">From every genre</p>
              </div>
            </div>

            {/* 2. Personalized Playlists */}
            <div className="flex items-center gap-4 group">
              <div className="h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors">
                <Crown className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Personalized Playlists</h4>
                <p className="text-xs text-zinc-400 font-normal mt-0.5">Music for every mood</p>
              </div>
            </div>

            {/* 3. Global Community */}
            <div className="flex items-center gap-4 group">
              <div className="h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Global Community</h4>
                <p className="text-xs text-zinc-400 font-normal mt-0.5">Artists. Fans. Together.</p>
              </div>
            </div>

            {/* 4. Listen Everywhere */}
            <div className="flex items-center gap-4 group">
              <div className="h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors">
                <Laptop className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Listen Everywhere</h4>
                <p className="text-xs text-zinc-400 font-normal mt-0.5">On all your devices</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT SECTION: The Login Box (Centered on Mobile) ---- */}
        <div className="col-span-1 lg:col-span-5 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-sm sm:max-w-md bg-[#0e0c1f]/85 backdrop-blur-3xl border border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(139,92,246,0.15)] relative overflow-hidden">
            {/* Ambient Corner Glows inside Card */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Card Brand Header */}
            <div className="flex flex-col items-center text-center space-y-2 mb-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.6)]">
                <div className="h-full w-full rounded-full bg-[#0d0b1a] flex items-center justify-center">
                  <img
                    src="/sonara-icon.png"
                    alt="Sonara Logo"
                    className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                  />
                </div>
              </div>
              <span className="font-black text-xl tracking-widest text-white block uppercase">
                SONARA
              </span>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-zinc-400 uppercase -mt-1">
                MUSIC BEYOND BOUNDARIES.
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
                {authMode === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {authMode === "signin"
                  ? "Sign in to continue your musical journey."
                  : "Join Sonara and unlock unlimited master streaming."}
              </p>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {/* Email Address Input */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 sm:h-13 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 sm:h-13 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotOpen(true);
                  }}
                  className="hover:text-purple-300 text-purple-400 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Prominent Gradient Sign In Button */}
              <Button
                type="submit"
                disabled={busy}
                className="w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-600 hover:from-fuchsia-400 hover:via-purple-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(217,70,239,0.5)] active:scale-[0.99] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* "or continue with" Divider */}
            <div className="relative my-4 sm:my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#0e0c1f] text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                or continue with
              </span>
            </div>

            {/* Single Social Authentication: Google */}
            <div>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={busy}
                className="w-full h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center gap-3 text-sm font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-purple-500/40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Bottom Toggle Text */}
            <div className="pt-5 text-center text-xs text-zinc-400">
              {authMode === "signin" ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className="font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className="font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Bottom Copyright */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-zinc-500 border-t border-white/5">
        <span>© {new Date().getFullYear()} Sonara. Music Beyond Boundaries.</span>
      </footer>

      {/* ========================================================================= */}
      {/* 4. FORGOT PASSWORD MODAL (shadcn Dialog)                                  */}
      {/* ========================================================================= */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-[#0e0c1f] border-white/10 text-white rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Reset Password</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForgotOpen(false)}
                className="text-zinc-400 hover:text-white text-xs h-10 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={forgotBusy}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold text-xs h-10 px-5 rounded-xl border-none shadow-[0_0_15px_rgba(217,70,239,0.4)]"
              >
                {forgotBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
