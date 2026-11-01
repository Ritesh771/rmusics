import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Sonara — Privacy Policy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <ShieldCheck className="h-3.5 w-3.5" /> Privacy & Data Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">1. Overview</h2>
          <p>
            At Sonara (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we respect your privacy and are committed to protecting the personal data of all users. This Privacy Policy explains how information is collected, used, and safeguarded when you stream music, create playlists, and use Sonara services.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li><strong className="text-foreground">Account Information:</strong> When signing in with email or OAuth providers (like Google), we receive your basic profile details (email, display name, avatar).</li>
            <li><strong className="text-foreground">Streaming & Library Activity:</strong> We record the playlists you create or import, tracks you like, queue state, and your last 10 recently played songs to personalize your player experience.</li>
            <li><strong className="text-foreground">Audio Settings:</strong> Equalizer presets and theme selections are stored locally in your browser storage.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">3. How Your Data Is Stored & Protected</h2>
          <p>
            Your account data, playlists, and favorites are strictly tied to your authenticated account ID using encrypted connections and Row Level Security (RLS). Other users cannot access your private playlists, queue, or personal listening logs.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">4. User Rights & Data Deletion</h2>
          <p>
            You retain full ownership of your data. You may delete individual playlists, liked songs, or listening history at any time. For full account and data erasure, visit the <Link to="/data-deletion" className="text-primary hover:underline font-semibold">Data Deletion</Link> page.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">5. Contact</h2>
          <p>
            If you have questions regarding this Privacy Policy or your data, please contact the administrator via the support channels.
          </p>
        </section>
      </div>
    </div>
  );
}

