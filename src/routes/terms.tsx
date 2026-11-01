import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Sonara — Terms & Conditions" }] }),
  component: TermsPage,
});

function TermsPage() {
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
          <FileText className="h-3.5 w-3.5" /> Legal Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or streaming music via Sonara (&ldquo;Service&rdquo;), you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue using the Service.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">2. Permitted Use</h2>
          <p>
            Sonara provides audio streaming and personal playlist curation for non-commercial, personal entertainment purposes only. You agree not to distribute, resell, reverse engineer, or exploit the platform or audio streams for unlawful commercial gain.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your authenticated profile.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">4. Intellectual Property</h2>
          <p>
            Audio tracks, cover art, and artist trademarks are the property of their respective artists, rights holders, and publishers. Sonara does not claim ownership of third-party copyrighted materials.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/60">
          <h2 className="text-lg font-bold text-foreground">5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate community rules, attempt unauthorized system tampering, or abuse infrastructure bandwidth.
          </p>
        </section>
      </div>
    </div>
  );
}

