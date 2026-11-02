import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sonara.music",
  appName: "Sonara",
  webDir: ".output/public",
  // In production native app, Sonara connects to the live production server
  // to ensure all Nitro SSR endpoints, Cloudflare R2 streaming, and Spotify
  // sync work identically, while local native plugins provide audio & haptics.
  server: {
    url: "https://sonaramusics.vercel.app",
    cleartext: false,
    androidScheme: "https",
    iosScheme: "https",
    allowNavigation: [
      "https://sonaramusics.vercel.app",
      "https://rmusics.lovable.app",
      "https://*.supabase.co",
      "https://*.r2.cloudflarestorage.com",
      "https://accounts.spotify.com",
      "https://accounts.google.com",
    ],
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d0b14",
    },
    App: {
      // Hardware back button behavior
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#0d0b14",
  },
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    backgroundColor: "#0d0b14",
    preferredContentMode: "mobile",
    scheme: "Sonara",
  },
};

export default config;

