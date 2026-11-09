import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
const appVersion = packageJson.version ?? "0.0.0";
const appBuildDate = new Date().toISOString();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const requiredPublicEnv = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  ] as const;

  if (mode === "production") {
    const missingPublicEnv = requiredPublicEnv.filter((name) => !env[name]?.trim());
    if (missingPublicEnv.length > 0) {
      throw new Error(
        `Build de produção bloqueado: variáveis ausentes: ${missingPublicEnv.join(", ")}`,
      );
    }

    try {
      const supabaseUrl = new URL(env.VITE_SUPABASE_URL);
      if (!["http:", "https:"].includes(supabaseUrl.protocol)) {
        throw new Error("protocolo inválido");
      }
    } catch {
      throw new Error(
        "Build de produção bloqueado: VITE_SUPABASE_URL deve ser uma URL HTTP(S) válida",
      );
    }
  }

  const sentryRelease = env.VITE_SENTRY_RELEASE?.trim() || `caminho-boa-nova@${appVersion}`;
  const sentryUploadEnabled = Boolean(
    env.VITE_SENTRY_DSN?.trim()
      && env.SENTRY_AUTH_TOKEN?.trim()
      && env.SENTRY_ORG?.trim()
      && env.SENTRY_PROJECT?.trim(),
  );

  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      workbox: {
        cacheId: "v3",
        sourcemap: false,
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{css,html,ico,svg,woff2,webmanifest}"],
        globIgnores: ["migration-export/**", "**/*.zip", "**/*.sql"],
        importScripts: ["/push-sw.js"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: true,
        // Navigation requests — always go to network first so routing is fresh
        navigationPreload: true,
        runtimeCaching: [
          {
            // HTML navigation — network first so users always get latest routes
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase storage (avatars, files)
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // External images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Same-origin build assets are cached after first use instead of
            // being downloaded in a huge PWA install-time precache.
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              ["script", "style", "font"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets-runtime-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "CAMINHO",
        short_name: "CAMINHO",
        lang: "pt-BR",
        description: "Amar a Deus, amar ao próximo e servir ao mundo.",
        theme_color: "#D34E00",
        background_color: "#FFF8EF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
    sentryUploadEnabled && sentryVitePlugin({
      authToken: env.SENTRY_AUTH_TOKEN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      release: { name: sentryRelease },
      sourcemaps: {
        assets: "./dist/**",
        filesToDeleteAfterUpload: "./dist/**/*.map",
      },
      telemetry: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_DATE__: JSON.stringify(appBuildDate),
    __SENTRY_RELEASE__: JSON.stringify(sentryRelease),
  },
  build: {
    sourcemap: sentryUploadEnabled ? "hidden" : false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (!normalizedId.includes("node_modules")) return undefined;
          if (normalizedId.includes("react-dom") || normalizedId.includes("react-router-dom") || normalizedId.includes("react/")) return "vendor-react";
          if (normalizedId.includes("@supabase")) return "vendor-supabase";
          if (normalizedId.includes("@tanstack/react-query")) return "vendor-query";
          if (normalizedId.includes("@radix-ui")) return "vendor-radix";
          if (normalizedId.includes("framer-motion")) return "vendor-motion";
          if (normalizedId.includes("lucide-react")) return "vendor-icons";
          return undefined;
        },
      },
    },
  },
  });
});
