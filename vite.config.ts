import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"
import tailwindcss from "@tailwindcss/vite"

const basePath =
  process.env.BASE_PATH ||
  (process.env.VITE_GITHUB_PAGES ? "/Calcite/" : "./")

export default defineConfig({
  base: basePath,
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["Calcite-logo.png"],
      manifest: {
        name: "Calcite",
        short_name: "Calcite",
        description: "A personal productivity and second-brain workspace.",
        theme_color: "#0B0812",
        background_color: "#0B0812",
        display: "standalone",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: `${basePath}Calcite-logo.png`.replace(/\/\//g, "/"),
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any maskable",
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
