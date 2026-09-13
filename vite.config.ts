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
      includeAssets: ["Calcite-logo.png"],
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
            src: "/Calcite/Calcite-logo.png",
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