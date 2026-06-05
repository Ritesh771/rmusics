import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-hook";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — R Musics" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" />;

  const signIn = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error((res.error as Error).message ?? "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 via-black to-black p-6">
      <div className="w-full max-w-md bg-card/50 backdrop-blur rounded-2xl p-8 shadow-2xl border border-white/5">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mb-4">
            <Music className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold">R Musics</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Stream your music anywhere. Sign in to save playlists, likes & history.
          </p>
        </div>
        <Button
          onClick={signIn}
          disabled={busy}
          className="w-full h-12 rounded-full bg-white text-black hover:bg-white/90 font-semibold gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.6 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.6 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.1 16.3 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.1 5.2c-.4.4 6.7-4.9 6.7-14.9 0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          {busy ? "Connecting…" : "Continue with Google"}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing you agree to our terms and privacy policy.
        </p>
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
            R
          </div>
          <div className="text-left leading-tight">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Developed by</div>
            <a
              href="https://riteshn.me"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Ritesh N.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}