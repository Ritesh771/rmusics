import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      // Map 'lovable' provider back to standard providers if needed, or just let Supabase handle it.
      // We directly use Supabase OAuth since the Lovable proxy (~oauth) isn't available locally.
      const supabaseProvider = provider === "lovable" ? "google" : provider;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
        },
      });
      
      if (error) {
        return { error };
      }
      return { redirected: true, data };
    },
  },
};
