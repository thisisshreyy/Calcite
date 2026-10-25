import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { db, DbUser } from "../db.js"

const JWT_SECRET = process.env.JWT_SECRET || "calcite-default-secret-change-in-production"

export interface AuthenticatedRequest extends Request {
  user?: DbUser
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" })
    return
  }

  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = db.getUserById(payload.userId)
    if (!user) {
      res.status(401).json({ error: "User no longer exists" })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
    return
  }
}

export function generateToken(user: DbUser): string {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "90d",
  })
}
