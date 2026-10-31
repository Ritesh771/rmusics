import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { N as Navigate } from "../_libs/tanstack__react-router.mjs";
import { z as useAuth, I as Input, B as Button, D as Dialog, c as DialogContent, f as DialogHeader, g as DialogTitle, d as DialogDescription } from "./router-SYh-4Vc5.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { z as Music2, j as Crown, a2 as Users, L as Laptop, M as Mail, t as Lock, m as EyeOff, l as Eye, s as LoaderCircle, a as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const [authMode, setAuthMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [rememberMe, setRememberMe] = reactExports.useState(true);
  const [busy, setBusy] = reactExports.useState(false);
  const [forgotOpen, setForgotOpen] = reactExports.useState(false);
  const [forgotEmail, setForgotEmail] = reactExports.useState("");
  const [forgotBusy, setForgotBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("sonara_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const err = params.get("error_description") || hashParams.get("error_description");
      if (err) {
        toast.error(decodeURIComponent(err.replace(/\+/g, " ")));
      }
    }
  }, []);
  if (!loading && user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/" });
  const handleEmailAuth = async (e) => {
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
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
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
        const {
          error,
          data
        } = await supabase.auth.signUp({
          email: cleanEmail,
          password
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
    } catch (err) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };
  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        toast.error(error.message ?? "Google sign-in failed");
        setBusy(false);
      }
    } catch (err) {
      toast.error(err?.message ?? "An error occurred during authentication");
      setBusy(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    setForgotBusy(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/settings`
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset instructions sent to your email.");
        setForgotOpen(false);
      }
    } catch (err) {
      toast.error(err?.message ?? "Failed to send reset email");
    } finally {
      setForgotBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full bg-[#080711] text-white flex flex-col justify-between font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 pointer-events-none select-none z-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/sonara-login-bg.jpg", alt: "Sonara Atmosphere", className: "absolute inset-0 w-full h-full object-cover object-[25%_center] lg:object-center scale-[1.02]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#080711]/90 via-[#080711]/60 to-[#080711]/90" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#080711] via-transparent to-[#080711]/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed -top-32 -left-32 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[160px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed -bottom-32 -right-32 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[170px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative z-20 w-full max-w-7xl mx-auto px-6 py-6 hidden lg:flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.5)] flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full rounded-full bg-[#0d0b1a] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/sonara-icon.png", alt: "Sonara Logo", className: "h-8 w-8 object-contain" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xl tracking-widest text-white block uppercase leading-none", children: "SONARA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.25em] font-semibold text-zinc-400 uppercase block mt-1", children: "MUSIC BEYOND BOUNDARIES." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-7 text-xs font-semibold text-zinc-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hover:text-white transition-colors cursor-pointer", children: "Discover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hover:text-white transition-colors cursor-pointer", children: "Premium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hover:text-white transition-colors cursor-pointer", children: "Download" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hover:text-white transition-colors cursor-pointer", children: "Support" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAuthMode((m) => m === "signin" ? "signup" : "signin"), className: "text-xs font-bold tracking-wider text-white px-5 py-2 rounded-full border border-purple-500/60 bg-purple-950/40 hover:bg-purple-600/30 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer", children: authMode === "signin" ? "Sign Up" : "Sign In" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex lg:col-span-7 flex-col justify-center space-y-7 select-none pr-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]", children: "Your World." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(217,70,239,0.3)]", children: "Your Sound." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base sm:text-lg text-zinc-300/90 max-w-lg leading-relaxed font-normal", children: "Stream millions of songs, discover personalized playlists, and experience music without limits." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5 pt-2 max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music2, { className: "h-5 w-5 text-purple-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-white leading-tight", children: "Millions of Songs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 font-normal mt-0.5", children: "From every genre" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-purple-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-white leading-tight", children: "Personalized Playlists" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 font-normal mt-0.5", children: "Music for every mood" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-purple-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-white leading-tight", children: "Global Community" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 font-normal mt-0.5", children: "Artists. Fans. Together." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full bg-[#120F24]/90 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Laptop, { className: "h-5 w-5 text-purple-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-white leading-tight", children: "Listen Everywhere" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 font-normal mt-0.5", children: "On all your devices" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 lg:col-span-5 flex justify-center lg:justify-end w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm sm:max-w-md bg-[#0e0c1f]/85 backdrop-blur-3xl border border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(139,92,246,0.15)] relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-16 -right-16 w-44 h-44 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center space-y-2 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 sm:h-16 sm:w-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full rounded-full bg-[#0d0b1a] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/sonara-icon.png", alt: "Sonara Logo", className: "h-9 w-9 sm:h-10 sm:w-10 object-contain" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xl tracking-widest text-white block uppercase", children: "SONARA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.25em] font-semibold text-zinc-400 uppercase -mt-1", children: "MUSIC BEYOND BOUNDARIES." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black text-white pt-2", children: authMode === "signin" ? "Welcome Back" : "Create Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-zinc-400 font-normal", children: authMode === "signin" ? "Sign in to continue your musical journey." : "Join Sonara and unlock unlimited master streaming." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEmailAuth, className: "space-y-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "Email address", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-11 h-12 sm:h-13 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: showPassword ? "text" : "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-11 pr-11 h-12 sm:h-13 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer", "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-zinc-400 pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), className: "rounded border-white/20 bg-white/5 text-purple-500 focus:ring-0 cursor-pointer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remember me" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setForgotEmail(email);
              setForgotOpen(true);
            }, className: "hover:text-purple-300 text-purple-400 font-medium transition-colors cursor-pointer", children: "Forgot password?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, className: "w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-600 hover:from-fuchsia-400 hover:via-purple-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(217,70,239,0.5)] active:scale-[0.99] transition-all cursor-pointer border-none flex items-center justify-center gap-2", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: authMode === "signin" ? "Sign In" : "Create Account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-4 sm:my-5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-white/10" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative px-3 bg-[#0e0c1f] text-[11px] uppercase tracking-wider text-zinc-500 font-semibold", children: "or continue with" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: signInWithGoogle, disabled: busy, className: "w-full h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center gap-3 text-sm font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-purple-500/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Continue with Google" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-5 text-center text-xs text-zinc-400", children: authMode === "signin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthMode("signup"), className: "font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline underline-offset-2 cursor-pointer", children: "Sign Up" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthMode("signin"), className: "font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline underline-offset-2 cursor-pointer", children: "Sign In" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "relative z-10 w-full py-4 text-center text-[11px] text-zinc-500 border-t border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Sonara. Music Beyond Boundaries."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: forgotOpen, onOpenChange: setForgotOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "bg-[#0e0c1f] border-white/10 text-white rounded-3xl max-w-md p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl font-bold text-white", children: "Reset Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs text-zinc-400", children: "Enter your email address and we'll send you a link to reset your password." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleForgotPassword, className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "Enter your email address", value: forgotEmail, onChange: (e) => setForgotEmail(e.target.value), className: "pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setForgotOpen(false), className: "text-zinc-400 hover:text-white text-xs h-10 px-4 rounded-xl", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: forgotBusy, className: "bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold text-xs h-10 px-5 rounded-xl border-none shadow-[0_0_15px_rgba(217,70,239,0.4)]", children: forgotBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }) : "Send Reset Link" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LoginPage as component
};
