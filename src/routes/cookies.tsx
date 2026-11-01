import { createFileRoute, Link } from "@tanstack/react-router";
import { Cookie, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Sonara — Cookie Policy" }] }),
  component: CookiesPage,
});

function CookiesPage() {
  const { user } = useAuth();
  const returnTo = user ? "/settings" : "/login";
  const returnLabel = user ? "Back to Settings" : "Back to Sign In";

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-8 animate-fade-in text-foreground">
      <Link to={returnTo} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> {returnLabel}
      </Link>

      <div className="space-y-2 border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/25">
          <Cookie className="h-3.5 w-3.5" /> Storage & Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">1. What Are Cookies & Local Storage?</h2>
          <p>
            Cookies and browser LocalStorage are small data items placed on your device to remember authentication sessions, audio volume preferences, and equalizer sound curve presets.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">2. What We Store</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li><strong className="text-foreground">Essential Session Cookies:</strong> Kept by Supabase Auth to keep you securely signed in.</li>
            <li><strong className="text-foreground">Local Audio Settings:</strong> LocalStorage keys (such as equalizer preset, volume level, mood backdrop preferences) so your sound preferences persist across refreshes.</li>
            <li><strong className="text-foreground">Theme Preference:</strong> Remembers your chosen Dark or Light appearance mode.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">3. No Third-Party Tracking Ads</h2>
          <p>
            Sonara does NOT sell your data or use third-party behavioral advertising cookies to track you across foreign websites.
          </p>
        </section>
      </div>
    </div>
  );
}

