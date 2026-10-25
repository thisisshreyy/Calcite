import fs from "fs"
import path from "path"

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data")

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function writeAtomic(filePath: string, data: string) {
  const dir = path.dirname(filePath)
  ensureDir(dir)
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  fs.writeFileSync(tempPath, data, "utf-8")
  fs.renameSync(tempPath, filePath)
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback
    }
    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export type DbUser = {
  id: string
  googleId: string
  email: string
  name: string
  picture?: string
  createdAt: string
  updatedAt: string
}

export type UserWorkspaceRecord = {
  userId: string
  data: unknown
  updatedAt: string
  version: number
}

class Database {
  private usersFile: string
  private syncDir: string

  constructor() {
    ensureDir(DATA_DIR)
    this.usersFile = path.join(DATA_DIR, "users.json")
    this.syncDir = path.join(DATA_DIR, "sync")
    ensureDir(this.syncDir)
  }

  private getAllUsers(): Record<string, DbUser> {
    return readJson<Record<string, DbUser>>(this.usersFile, {})
  }

  private saveAllUsers(users: Record<string, DbUser>) {
    writeAtomic(this.usersFile, JSON.stringify(users, null, 2))
  }

  getUserById(id: string): DbUser | null {
    const users = this.getAllUsers()
    return users[id] || null
  }

  getUserByGoogleId(googleId: string): DbUser | null {
    const users = this.getAllUsers()
    for (const user of Object.values(users)) {
      if (user.googleId === googleId) {
        return user
      }
    }
    return null
  }

  getUserByEmail(email: string): DbUser | null {
    const users = this.getAllUsers()
    for (const user of Object.values(users)) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }

  upsertGoogleUser(input: {
    googleId: string
    email: string
    name: string
    picture?: string
  }): DbUser {
    const users = this.getAllUsers()
    const now = new Date().toISOString()
    const existing = this.getUserByGoogleId(input.googleId) || this.getUserByEmail(input.email)

    if (existing) {
      existing.name = input.name || existing.name
      existing.picture = input.picture || existing.picture
      existing.googleId = input.googleId
      existing.updatedAt = now
      users[existing.id] = existing
      this.saveAllUsers(users)
      return existing
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const newUser: DbUser = {
      id,
      googleId: input.googleId,
      email: input.email,
      name: input.name,
      picture: input.picture,
      createdAt: now,
      updatedAt: now,
    }

    users[id] = newUser
    this.saveAllUsers(users)
    return newUser
  }

  getUserWorkspace(userId: string): UserWorkspaceRecord | null {
    const filePath = path.join(this.syncDir, `${userId}.json`)
    return readJson<UserWorkspaceRecord | null>(filePath, null)
  }

  saveUserWorkspace(userId: string, data: unknown, version = 2): UserWorkspaceRecord {
    const filePath = path.join(this.syncDir, `${userId}.json`)
    const record: UserWorkspaceRecord = {
      userId,
      data,
      updatedAt: new Date().toISOString(),
      version,
    }
    writeAtomic(filePath, JSON.stringify(record, null, 2))
    return record
  }
}

export const db = new Database()
