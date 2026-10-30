import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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