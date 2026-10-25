import { Router, Response } from "express"
import { db } from "../db.js"
import { authMiddleware, AuthenticatedRequest, generateToken } from "../middleware/auth.js"

const router = Router()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""

type GoogleTokenInfo = {
  sub?: string
  email?: string
  email_verified?: string | boolean
  name?: string
  picture?: string
  aud?: string
  error_description?: string
}

router.post("/google", async (req, res): Promise<void> => {
  try {
    const { credential, demo, email, name, picture } = req.body

    // Demo / Local Test Sign-In
    if (demo) {
      const demoEmail = (email || "calcite.user@gmail.com").trim().toLowerCase()
      const demoName = (name || "Calcite User").trim()
      const demoPicture = picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(demoName)}&background=9B6CFF&color=fff`

      const user = db.upsertGoogleUser({
        googleId: `demo_${demoEmail}`,
        email: demoEmail,
        name: demoName,
        picture: demoPicture,
      })

      const token = generateToken(user)
      const existingWorkspace = db.getUserWorkspace(user.id)

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
        hasCloudData: Boolean(existingWorkspace?.data),
        cloudUpdatedAt: existingWorkspace?.updatedAt,
      })
      return
    }

    // Real Google Identity Services Credential (ID Token)
    if (!credential) {
      res.status(400).json({ error: "Missing Google ID token credential" })
      return
    }

    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    const response = await fetch(verifyUrl)

    if (!response.ok) {
      const errorText = await response.text()
      res.status(401).json({ error: "Failed to verify Google ID token", details: errorText })
      return
    }

    const payload = (await response.json()) as GoogleTokenInfo

    if (!payload.sub || !payload.email) {
      res.status(401).json({ error: "Invalid Google token payload" })
      return
    }

    if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID) {
      res.status(401).json({ error: "Google token audience mismatch" })
      return
    }

    const user = db.upsertGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture,
    })

    const token = generateToken(user)
    const existingWorkspace = db.getUserWorkspace(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      hasCloudData: Boolean(existingWorkspace?.data),
      cloudUpdatedAt: existingWorkspace?.updatedAt,
    })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({ error: "Internal server error during authentication" })
  }
})

router.get("/me", authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const workspace = db.getUserWorkspace(req.user.id)

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    },
    hasCloudData: Boolean(workspace?.data),
    cloudUpdatedAt: workspace?.updatedAt,
  })
})

export default router
