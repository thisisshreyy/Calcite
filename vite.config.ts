import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: "/Calcite/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Calcite",
        short_name: "Calcite",
        description:
          "A personal productivity and second-brain workspace.",
        theme_color: "#0B0812",
        background_color: "#0B0812",
        display: "standalone",
        start_url: "/Calcite/",
        scope: "/Calcite/",
        icons: [
          {
            src: "/Calcite/pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/Calcite/pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})