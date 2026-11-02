import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

export type AuthState = {
  user: User | null;
  loading: boolean;
};

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  setSession: (session) => set({
    user: session?.user ?? null,
    session: session ?? null,
    loading: false,
    initialized: true,
  }),
}));

// Initialize auth state once on client startup
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  // Handle native deep link callback when returning from OAuth in browser
  if (Capacitor.isNativePlatform()) {
    App.addListener("appUrlOpen", async ({ url }) => {
      try {
        await Browser.close().catch(() => {});
      } catch {}

      if (!url) return;

      // Check if URL contains auth tokens / code
      // Format 1: com.sonara.music://auth/callback#access_token=...&refresh_token=...
      // Format 2: com.sonara.music://auth/callback?code=...
      if (url.includes("com.sonara.music://") || url.includes("access_token") || url.includes("code=")) {
        const hashIndex = url.indexOf("#");
        const queryIndex = url.indexOf("?");

        if (hashIndex !== -1) {
          const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data?.session) {
              useAuthStore.getState().setSession(data.session);
            }
            return;
          }
        }

        if (queryIndex !== -1) {
          const queryParams = new URLSearchParams(url.substring(queryIndex + 1));
          const code = queryParams.get("code");
          if (code) {
            const { data } = await supabase.auth.exchangeCodeForSession(code);
            if (data?.session) {
              useAuthStore.getState().setSession(data.session);
            }
          }
        }
      }
    });
  }
}

export function useAuth(): AuthState {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  return { user, loading };
}

export function getDisplayName(user: User | null): string {
  if (!user) return "";
  const md = user.user_metadata || {};
  return md.full_name || md.name || (user.email ? user.email.split("@")[0] : "User");
}

export function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}