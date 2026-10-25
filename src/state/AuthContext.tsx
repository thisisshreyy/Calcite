/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  applyUnifiedWorkspace,
  getUnifiedWorkspace,
  type UnifiedWorkspace,
} from "@/lib/storage"
import { useCalcite } from "./CalciteStore"

export type AuthUser = {
  id: string
  email: string
  name: string
  picture?: string
}

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error"

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null
  googleClientId: string
  setGoogleClientId: (id: string) => void
  loginWithGoogle: (credential: string) => Promise<boolean>
  loginWithDemo: (email?: string, name?: string) => Promise<boolean>
  logout: (clearLocal?: boolean) => void
  syncNow: (forceUpload?: boolean) => Promise<void>
  restoreFromCloud: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AUTH_TOKEN_KEY = "calcite_auth_token"
const AUTH_USER_KEY = "calcite_auth_user"
const GOOGLE_CLIENT_ID_KEY = "calcite_google_client_id"
const LAST_SYNCED_KEY = "calcite_last_synced_at"

// Configurable API URL for standalone/static deployment
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  }
  return ""
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useCalcite()
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  })
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [googleClientId, setGoogleClientIdState] = useState<string>(() => {
    return (
      localStorage.getItem(GOOGLE_CLIENT_ID_KEY) ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      ""
    )
  })
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(LAST_SYNCED_KEY)
  })
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const syncTimeoutRef = useRef<number | null>(null)
  const isInitialLoadRef = useRef(true)

  const setGoogleClientId = useCallback((id: string) => {
    setGoogleClientIdState(id)
    if (id) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, id)
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY)
    }
  }, [])

  // Verify stored token on initial load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
          if (data.cloudUpdatedAt) {
            setLastSyncedAt(data.cloudUpdatedAt)
            localStorage.setItem(LAST_SYNCED_KEY, data.cloudUpdatedAt)
          }
          setSyncStatus("synced")
        } else {
          // Token expired or invalid
          setToken(null)
          setUser(null)
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem(AUTH_USER_KEY)
        }
      } catch (err) {
        console.warn("Could not verify session with backend, continuing in offline mode:", err)
        setSyncStatus("offline")
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [token])

  // Core sync function to upload local state to cloud
  const pushToCloud = useCallback(
    async (authToken: string, customWorkspace?: UnifiedWorkspace) => {
      try {
        setSyncStatus("syncing")
        setSyncError(null)

        const workspace = customWorkspace || getUnifiedWorkspace(state)

        const response = await fetch(`${getApiBaseUrl()}/api/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            data: workspace,
            version: workspace.version,
          }),
        })

        if (!response.ok) {
          throw new Error(`Sync failed with status: ${response.status}`)
        }

        const result = await response.json()
        const now = result.updatedAt || new Date().toISOString()
        setLastSyncedAt(now)
        localStorage.setItem(LAST_SYNCED_KEY, now)
        setSyncStatus("synced")
      } catch (err) {
        console.warn("Cloud sync error, local data remains safe:", err)
        setSyncStatus("offline")
        setSyncError(err instanceof Error ? err.message : "Sync failed")
      }
    },
    [state]
  )

  // Download cloud data and hydrate local state
  const restoreFromCloud = useCallback(async (): Promise<boolean> => {
    if (!token) return false

    try {
      setSyncStatus("syncing")
      const response = await fetch(`${getApiBaseUrl()}/api/sync`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch cloud workspace")
      }

      const result = await response.json()
      if (result.data) {
        const cloudWorkspace = result.data as UnifiedWorkspace
        applyUnifiedWorkspace(cloudWorkspace)

        if (cloudWorkspace.state) {
          dispatch({ type: "state/hydrate", state: cloudWorkspace.state })
        }

        const now = result.updatedAt || new Date().toISOString()
        setLastSyncedAt(now)
        localStorage.setItem(LAST_SYNCED_KEY, now)
        setSyncStatus("synced")
        return true
      }

      setSyncStatus("synced")
      return false
    } catch (err) {
      console.error("Error restoring from cloud:", err)
      setSyncStatus("error")
      setSyncError(err instanceof Error ? err.message : "Restore failed")
      return false
    }
  }, [token, dispatch])

  // Login handler with Google ID Token Credential
  const loginWithGoogle = useCallback(
    async (credential: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setSyncError(null)

        const response = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || "Authentication failed")
        }

        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))

        if (data.hasCloudData) {
          // Has existing cloud data: fetch and hydrate
          await restoreFromCloud()
        } else {
          // New cloud user: immediately upload existing local workspace
          await pushToCloud(data.token)
        }

        setIsLoading(false)
        return true
      } catch (err) {
        console.error("Login with Google error:", err)
        setSyncError(err instanceof Error ? err.message : "Google sign-in failed")
        setIsLoading(false)
        return false
      }
    },
    [pushToCloud, restoreFromCloud]
  )

  // Demo login handler (for testing when Google Client ID is not yet created)
  const loginWithDemo = useCallback(
    async (email = "calcite.user@gmail.com", name = "Calcite User"): Promise<boolean> => {
      try {
        setIsLoading(true)
        setSyncError(null)

        const response = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo: true, email, name }),
        })

        if (!response.ok) {
          throw new Error("Demo login failed")
        }

        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))

        if (data.hasCloudData) {
          await restoreFromCloud()
        } else {
          await pushToCloud(data.token)
        }

        setIsLoading(false)
        return true
      } catch (err) {
        console.error("Demo login error:", err)
        setSyncError(err instanceof Error ? err.message : "Demo sign-in failed")
        setIsLoading(false)
        return false
      }
    },
    [pushToCloud, restoreFromCloud]
  )

  const logout = useCallback((clearLocal = false) => {
    setToken(null)
    setUser(null)
    setSyncStatus("idle")
    setLastSyncedAt(null)
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(LAST_SYNCED_KEY)

    if (clearLocal) {
      window.location.reload()
    }
  }, [])

  const syncNow = useCallback(
    async (forceUpload = false) => {
      if (!token) return
      if (forceUpload) {
        await pushToCloud(token)
      } else {
        await restoreFromCloud()
      }
    },
    [token, pushToCloud, restoreFromCloud]
  )

  // Auto-sync debounced when state changes
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    if (!token) {
      return
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      pushToCloud(token)
    }, 1500)

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [state, token, pushToCloud])

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      if (token) {
        pushToCloud(token)
      }
    }
    const handleOffline = () => {
      setSyncStatus("offline")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [token, pushToCloud])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        syncStatus,
        lastSyncedAt,
        syncError,
        googleClientId,
        setGoogleClientId,
        loginWithGoogle,
        loginWithDemo,
        logout,
        syncNow,
        restoreFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return value
}
