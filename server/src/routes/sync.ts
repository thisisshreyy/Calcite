import { Router, Response } from "express"
import { db } from "../db.js"
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js"

const router = Router()

// All sync routes require authentication
router.use(authMiddleware)

router.get("/", (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const workspace = db.getUserWorkspace(req.user.id)

  if (!workspace || !workspace.data) {
    res.json({
      success: true,
      data: null,
      updatedAt: null,
      version: 2,
    })
    return
  }

  res.json({
    success: true,
    data: workspace.data,
    updatedAt: workspace.updatedAt,
    version: workspace.version,
  })
})

router.post("/", (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const { data, version = 2 } = req.body

  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Invalid data payload for sync" })
    return
  }

  const record = db.saveUserWorkspace(req.user.id, data, version)

  res.json({
    success: true,
    updatedAt: record.updatedAt,
    version: record.version,
  })
})

export default router
