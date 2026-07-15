import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Player } from "@/components/Player";
import { NowPlaying } from "@/components/NowPlaying";
import { QueuePanel } from "@/components/QueuePanel";
import { Toaster } from "@/components/ui/sonner";
import { usePersistentQueue } from "@/lib/use-persistent-queue";
import { useAuth } from "@/lib/auth-hook";
import { useTheme } from "@/lib/theme-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "R Musics — Free Music Streaming & Playlists" },
      { name: "description", content: "R Musics — free Spotify-style music streaming. Discover songs, build playlists, like tracks, and enjoy a beautiful player anywhere." },
      { name: "keywords", content: "r musics, rmusics, r music, music streaming, free music player, playlists, online music, spotify alternative" },
      { name: "author", content: "Ritesh N." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "R Musics" },
      { property: "og:title", content: "R Musics — Free Music Streaming" },
      { property: "og:description", content: "Stream music, build playlists and enjoy a beautiful player. Free on any device." },
      { property: "og:type", content: "website" },
      // Dual theme-color so the PWA / iOS status bar / Android chrome match
      // the user's system (or in-app) theme. The theme-store also swaps the
      // no-media fallback live when the user toggles theme inside the app.
      { name: "theme-color", content: "#000000" },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#000000" },
      { name: "color-scheme", content: "light dark" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "R Musics" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "R Musics — Free Music Streaming" },
      { name: "twitter:description", content: "Stream music, build playlists, enjoy a beautiful player." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/9Fqw0s8nIfV04662WALvNrgwsK33/social-images/social-1779678708323-1833.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/9Fqw0s8nIfV04662WALvNrgwsK33/social-images/social-1779678708323-1833.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "R Musics",
          alternateName: ["RMusics", "R Music"],
          url: "https://rmusics.lovable.app/",
          description: "Free Spotify-style music streaming app with playlists and a beautiful player.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://rmusics.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "R Musics",
          url: "https://rmusics.lovable.app/",
          logo: "https://rmusics.lovable.app/icon-512.png",
          founder: { "@type": "Person", name: "Ritesh N.", url: "https://riteshn.me" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rmusics.theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RootInner />
    </QueryClientProvider>
  );
}

function RootInner() {
  const { user } = useAuth();
  usePersistentQueue(user?.id ?? null);
  const theme = useTheme();
  return (
    <>
      <Outlet />
      <Player />
      <NowPlaying />
      <QueuePanel />
      <Toaster theme={theme} />
    </>
  );
}
