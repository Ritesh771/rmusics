import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, AlertTriangle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/data-deletion")({
  head: () => ({ meta: [{ title: "Sonara — Data Deletion & Privacy Controls" }] }),
  component: DataDeletionPage,
});

function DataDeletionPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const returnTo = user ? "/settings" : "/login";
  const returnLabel = user ? "Back to Settings" : "Back to Sign In";

  const handleClearActivity = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setBusy(true);
    try {
      // Clear listening history, queue, and liked songs
      await Promise.all([
        supabase.from("recently_played").delete().eq("user_id", user.id),
        supabase.from("liked_songs").delete().eq("user_id", user.id),
        supabase.from("user_queue").delete().eq("user_id", user.id),
      ]);
      toast.success("Listening history, queue, and liked songs cleared successfully.");
      setConfirmed(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to clear account activity");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAllPlaylists = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete all personal playlists created on your account? This action cannot be undone.")) {
      return;
    }
    setBusy(true);
    try {
      await supabase.from("playlists").delete().eq("user_id", user.id);
      toast.success("All personal playlists deleted.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete playlists");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-8 animate-fade-in text-foreground">
      <Link to={returnTo} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> {returnLabel}
      </Link>

      <div className="space-y-2 border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold border border-destructive/25">
          <Trash2 className="h-3.5 w-3.5" /> User Data Controls
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Data Deletion & Privacy</h1>
        <p className="text-sm text-muted-foreground">
          Manage, clear, or request permanent removal of your account activities and personal data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Clear Listening History & Likes */}
        <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border/70 space-y-4 shadow-sm hover:border-border transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Clear Listening History & Liked Songs</h3>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Permanently wipes all recently played song records, liked songs, and saved playback queue attached to your profile.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={busy || !user}
              onClick={handleClearActivity}
              className="text-xs font-semibold text-destructive hover:bg-destructive/15 border-destructive/40 shrink-0 cursor-pointer"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
              Clear Activity
            </Button>
          </div>
        </div>

        {/* Delete All Custom Playlists */}
        <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border/70 space-y-4 shadow-sm hover:border-border transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Delete All Personal Playlists</h3>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Deletes every playlist created or imported under your account. Shared global library songs in the catalog will remain unaffected.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={busy || !user}
              onClick={handleDeleteAllPlaylists}
              className="text-xs font-semibold text-destructive hover:bg-destructive/15 border-destructive/40 shrink-0 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Playlists
            </Button>
          </div>
        </div>

        {/* Complete Account Deletion Instructions */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-500 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Permanent Account Eradication</span>
          </div>
          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            In accordance with GDPR & CCPA privacy regulations, if you wish to permanently delete your entire authenticated profile and associated records, you can submit an instant erasure request by contacting the Sonara administrative team or signing out and clearing your browser storage.
          </p>
        </div>
      </div>
    </div>
  );
}

