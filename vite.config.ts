// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    environments: {
      client: {
        build: {
          rollupOptions: {
            input: { index: "virtual:tanstack-start-client-entry" },
          },
        },
      },
      ssr: {
        build: {
          rollupOptions: {
            input: "virtual:tanstack-start-server-entry",
          },
        },
      },
    },
    plugins: [
      {
        name: "oauth-redirect-handler",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith("/~oauth/initiate")) {
              const origin = req.headers.host ? `http://${req.headers.host}` : "http://localhost:8080";
              const url = new URL(req.url, origin);
              const provider = url.searchParams.get("provider") || "google";
              const redirectUri = url.searchParams.get("redirect_uri") || `${origin}/`;
              const supabaseUrl = process.env.SUPABASE_URL || "https://zbatrdrpuvxqbbcpcfha.supabase.co";
              res.writeHead(302, {
                Location: `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUri)}`,
              });
              res.end();
              return;
            }
            next();
          });
        },
      },
    ],
  },
});
