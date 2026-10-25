import express from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

import authRouter from "./routes/auth.js"
import syncRouter from "./routes/sync.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = parseInt(process.env.PORT || "3000", 10)

app.use(cors())
app.use(express.json({ limit: "50mb" }))

// API Routes
app.use("/api/auth", authRouter)
app.use("/api/sync", syncRouter)

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "calcite-server",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// Static frontend serving in production / Docker
const potentialDistPaths = [
  path.resolve(process.cwd(), "dist"),
  path.resolve(__dirname, "../../dist"),
  path.resolve(__dirname, "../dist"),
]

const distPath = potentialDistPaths.find((p) => fs.existsSync(p))

if (distPath) {
  console.log(`Serving static files from: ${distPath}`)
  app.use(express.static(distPath))

  // Fallback to index.html for SPA client-side routing
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next()
    }
    res.sendFile(path.join(distPath, "index.html"))
  })
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Calcite server running on http://0.0.0.0:${PORT}`)
})
