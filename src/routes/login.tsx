import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
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

  const getRedirectPath = () => {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    return redirect && redirect.startsWith("/") ? redirect : "/";
  };

  if (!loading && user) return <Navigate to={getRedirectPath()} />;

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
      const redirectPath = getRedirectPath();
      const redirectUrl = redirectPath !== "/"
        ? `${window.location.origin}${redirectPath}`
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
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
    <div className="min-h-screen w-full bg-[#05030f] text-white flex flex-col justify-between font-sans selection:bg-[#d62cff] selection:text-white relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC RADIAL BACKDROP IN THE EXACT PALETTE                         */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(60% 50% at 45% 55%, rgba(110,40,220,0.45), transparent 70%),
              radial-gradient(40% 40% at 10% 70%, rgba(60,40,200,0.35), transparent 70%),
              radial-gradient(40% 40% at 90% 10%, rgba(214,44,255,0.15), transparent 70%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1536px] w-full mx-auto px-4 sm:px-12 pt-6 sm:pt-8 pb-6 sm:pb-8 flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* 2. TOP HEADER (Standard clean branding only)                              */}
        {/* ========================================================================= */}
        <header className="flex items-center justify-center md:justify-start w-full">
          {/* Logo & Brand - single canonical header */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] rounded-full bg-gradient-to-br from-[#ff2bf0] via-[#8a3dff] to-[#18b4ff] grid place-items-center shadow-[0_0_30px_rgba(214,44,255,0.5)] shrink-0">
              <svg className="w-[58%] h-[58%]" viewBox="0 0 64 64" fill="none" stroke="#14083a" strokeWidth="6" strokeLinecap="round">
                <path d="M8 24c16-6 32-4 48 4" />
                <path d="M12 36c13-4 26-3 38 3" />
                <path d="M17 47c10-3 19-2 28 2" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold tracking-[0.08em] text-2xl sm:text-[32px] leading-none uppercase text-white font-['Syncopate',sans-serif]">
                SONARA
              </div>
              <div className="text-[9px] sm:text-[10px] tracking-[0.38em] text-[#a9a6c4] mt-1.5 uppercase font-medium">
                Music beyond boundaries.
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. MAIN SECTION: Hero (Desktop) + Clean Professional Auth Card            */}
        {/* ========================================================================= */}
        <main className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.25fr_1fr] gap-8 xl:gap-14 my-6 sm:my-auto items-center">
          {/* ---------------- LEFT HERO SECTION (Desktop Only) ---------------- */}
          <section className="relative min-h-[520px] lg:min-h-[740px] hidden md:block">
            <span className="inline-block py-2 px-5 border border-[#8b3dff] rounded-[30px] text-[11px] tracking-[0.35em] text-[#c9a6ff] uppercase font-semibold">
              Music beyond boundaries.
            </span>

            <h1 className="text-5xl lg:text-[70px] font-semibold leading-[1.08] tracking-[-0.01em] mt-7 text-white">
              Your{" "}
              <span className="bg-gradient-to-r from-[#e233ff] to-[#6a5cff] bg-clip-text text-transparent">
                World.
              </span>
              <br />
              Your{" "}
              <span className="bg-gradient-to-r from-[#e233ff] to-[#6a5cff] bg-clip-text text-transparent">
                Sound.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-[20px] leading-[1.55] text-[#c9c6e0] font-light pl-2">
              Stream. Discover. Create. Connect.
              <br />
              A world of music without limits.
            </p>

            <ul className="mt-9 space-y-5 relative z-10 list-none">
              <li className="flex items-center gap-5">
                <div className="w-[58px] h-[58px] rounded-full border border-[rgba(139,61,255,0.45)] bg-[rgba(79,40,170,0.35)] grid place-items-center text-[#a56bff] shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3v12.3A3.5 3.5 0 1 0 11 18.5V8l8-2v7.3A3.5 3.5 0 1 0 21 16.5V2z" />
                  </svg>
                </div>
                <div>
                  <b className="font-medium text-lg text-white block">Millions of Songs</b>
                  <small className="text-[#a9a6c4] text-[15px]">From every genre</small>
                </div>
              </li>

              <li className="flex items-center gap-5">
                <div className="w-[58px] h-[58px] rounded-full border border-[rgba(139,61,255,0.45)] bg-[rgba(79,40,170,0.35)] grid place-items-center text-[#a56bff] shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                    <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
                  </svg>
                </div>
                <div>
                  <b className="font-medium text-lg text-white block">Personalized Playlists</b>
                  <small className="text-[#a9a6c4] text-[15px]">Music for every mood</small>
                </div>
              </li>

              <li className="flex items-center gap-5">
                <div className="w-[58px] h-[58px] rounded-full border border-[rgba(139,61,255,0.45)] bg-[rgba(79,40,170,0.35)] grid place-items-center text-[#a56bff] shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="8" r="3.5" />
                    <circle cx="17" cy="9" r="2.8" />
                    <path d="M2 20c0-4 3-6 7-6s7 2 7 6zM16 14c3 0 6 1.5 6 5h-4.5c0-2-.5-3.5-1.5-5z" />
                  </svg>
                </div>
                <div>
                  <b className="font-medium text-lg text-white block">Global Community</b>
                  <small className="text-[#a9a6c4] text-[15px]">Artists. Fans. Together.</small>
                </div>
              </li>

              <li className="flex items-center gap-5">
                <div className="w-[58px] h-[58px] rounded-full border border-[rgba(139,61,255,0.45)] bg-[rgba(79,40,170,0.35)] grid place-items-center text-[#a56bff] shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                    <rect x="2" y="4" width="16" height="11" rx="1.5" />
                    <path d="M6 19h8M10 15v4" />
                    <rect x="16" y="9" width="6" height="11" rx="1.5" fill="#2a1760" />
                  </svg>
                </div>
                <div>
                  <b className="font-medium text-lg text-white block">Listen Everywhere</b>
                  <small className="text-[#a9a6c4] text-[15px]">On all your devices</small>
                </div>
              </li>
            </ul>

            {/* Glowing Dome Art */}
            <div className="absolute right-[-20px] top-[70px] w-[500px] h-[650px] pointer-events-none z-0 opacity-80 xl:opacity-100" aria-hidden="true">
              <div className="absolute inset-[60px_0_0_40px] rounded-[50%_50%_0_0] bg-[radial-gradient(circle_at_50%_30%,rgba(120,60,255,0.55),rgba(40,20,120,0.15)_70%)] border-t border-[rgba(160,110,255,0.25)]" />
              <svg viewBox="0 0 560 700" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="sk" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#d98aff" />
                    <stop offset=".6" stopColor="#7b3dff" />
                    <stop offset="1" stopColor="#2a1a8a" />
                  </linearGradient>
                  <linearGradient id="hr" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3a1280" />
                    <stop offset="1" stopColor="#b020e0" />
                  </linearGradient>
                </defs>
                <path d="M150 700c10-120 60-170 130-200l60-30c60 40 160 70 220 230z" fill="#1b1052" />
                <path d="M300 120c90-10 170 40 160 150-5 60-40 120-70 150-20 20-60 30-100 20z" fill="url(#hr)" />
                <path
                  d="M130 250c10-60 70-110 140-110 40 0 70 30 60 90-5 40-20 70-30 90 10 10 30 20 30 40 0 25-20 40-50 45-10 20-30 40-60 40-40 0-60-30-65-60-20-20-30-40-25-60-10-15-10-25-10-40 0-20 5-30 10-45z"
                  fill="url(#sk)"
                  opacity=".95"
                />
                <circle cx="330" cy="290" r="78" fill="#1a0f4a" stroke="#6a3bff" strokeOpacity=".5" />
                <circle cx="330" cy="290" r="36" fill="#6a4dff" />
                <path d="M300 130c70-30 150 20 150 100" fill="none" stroke="#1a0f4a" strokeWidth="22" strokeLinecap="round" />
              </svg>
            </div>
          </section>

          {/* ---------------- RIGHT AUTH PANEL (Standard Clean Card) ---------------- */}
          <section className="bg-gradient-to-br from-[rgba(24,20,48,0.95)] to-[rgba(10,9,22,0.98)] border border-[rgba(139,61,255,0.4)] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 text-center shadow-[0_0_60px_rgba(100,50,220,0.25)] relative w-full max-w-[460px] mx-auto md:ml-auto">
            <h2 className="text-2xl sm:text-[30px] font-bold text-white tracking-tight">
              {authMode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-[#a9a6c4] mt-2 text-sm sm:text-[15px] font-normal">
              {authMode === "signin"
                ? "Sign in to continue your musical journey."
                : "Join Sonara and explore a world of music."}
            </p>

            {/* Auth Form */}
            <form onSubmit={handleEmailAuth} className="mt-7 text-left space-y-3.5">
              {/* Email Field */}
              <div className="flex items-center gap-4 h-[56px] sm:h-[58px] px-5 bg-white/[0.04] border border-white/[0.12] rounded-[16px] text-[#a9a6c4] focus-within:border-[#8b3dff] focus-within:shadow-[0_0_0_3px_rgba(139,61,255,0.25)] transition">
                <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-white text-[16px] placeholder:text-[#9a97b6]"
                />
              </div>

              {/* Password Field */}
              <div className="flex items-center gap-4 h-[56px] sm:h-[58px] px-5 bg-white/[0.04] border border-white/[0.12] rounded-[16px] text-[#a9a6c4] focus-within:border-[#8b3dff] focus-within:shadow-[0_0_0_3px_rgba(139,61,255,0.25)] transition">
                <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-white text-[16px] placeholder:text-[#9a97b6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#a9a6c4] hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Toggle password visibility"
                >
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex justify-between items-center my-4 text-[15px] sm:text-[16px] text-[#d8d6ee]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded border border-white/30 bg-white/5 accent-[#8b3dff] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotOpen(true);
                  }}
                  className="text-[#b34dff] hover:text-[#d62cff] font-medium transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full h-[58px] rounded-[30px] text-white text-[18px] font-medium cursor-pointer bg-gradient-to-r from-[#f018ff] via-[#7a4dff] to-[#3d8bff] shadow-[0_8px_30px_rgba(140,60,255,0.45)] hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-3 border-0"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12h16M14 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* "or continue with" Divider */}
            <div className="flex items-center gap-4 my-6 text-[#a9a6c4] text-[15px]">
              <div className="flex-1 h-[1px] bg-white/20" />
              <span>or continue with</span>
              <div className="flex-1 h-[1px] bg-white/20" />
            </div>

            {/* Google Social Button */}
            <div className="flex">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={busy}
                className="flex-1 h-[58px] sm:h-[66px] rounded-[16px] border border-white/[0.12] bg-white/[0.04] text-white text-[17px] font-normal flex items-center justify-center gap-3 hover:border-[#8b3dff] transition cursor-pointer"
              >
                <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22 12.200c0-.7-.1-1.400-.2-2H12v3.800h5.600a4.800 4.800 0 0 1-2.100 3.200v2.600h3.400c2-1.800 3.100-4.500 3.100-7.600z" />
                  <path fill="#34A853" d="M12 22c2.800 0 5.200-.9 6.900-2.500l-3.400-2.600c-.9.600-2.100 1-3.500 1-2.700 0-5-1.800-5.800-4.300H2.700v2.700A10 10 0 0 0 12 22z" />
                  <path fill="#FBBC05" d="M6.200 13.600a6 6 0 0 1 0-3.800V7.100H2.700a10 10 0 0 0 0 9.200z" />
                  <path fill="#EA4335" d="M12 6c1.500 0 2.900.5 4 1.600l3-3A10 10 0 0 0 2.700 7.100l3.500 2.700C7 7.800 9.300 6 12 6z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Toggle Footer */}
            <p className="mt-7 text-[#cfcde6] text-[15px] sm:text-[16px]">
              {authMode === "signin" ? (
                <>
                  Don&apos;t have an account?
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className="text-[#b34dff] font-medium hover:underline ml-2.5 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className="text-[#b34dff] font-medium hover:underline ml-2.5 cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </section>
        </main>

        {/* Footer with Legal links and copyright */}
        <footer className="mt-8 flex flex-col items-center gap-3 text-xs text-[#a9a6c4]/80">
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs text-zinc-400">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-zinc-600">•</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-zinc-600">•</span>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
            <span className="text-zinc-600">•</span>
            <Link to="/data-deletion" className="hover:text-white transition-colors">
              Data Controls
            </Link>
          </nav>
          <span className="text-[11px] text-zinc-500">© {new Date().getFullYear()} Sonara — Music Beyond Boundaries.</span>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* 4. FORGOT PASSWORD MODAL (shadcn Dialog)                                  */}
      {/* ========================================================================= */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-[#0e0c1f] border-[rgba(139,61,255,0.45)] text-white rounded-3xl max-w-md p-6">
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
                className="pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-[#8b3dff] focus:ring-1 focus:ring-[#8b3dff] text-sm"
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
                className="bg-gradient-to-r from-[#f018ff] via-[#7a4dff] to-[#3d8bff] hover:brightness-110 text-white font-bold text-xs h-10 px-5 rounded-xl border-none shadow-[0_0_15px_rgba(217,70,239,0.4)]"
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
