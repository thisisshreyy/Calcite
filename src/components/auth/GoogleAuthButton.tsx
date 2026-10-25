import { useEffect, useRef, useState } from "react"
import { Check, Cloud, CloudOff, Loader2, LogIn, LogOut, Settings2 } from "lucide-react"
import { useAuth } from "@/state/AuthContext"

type GoogleAuthButtonProps = {
  compact?: boolean
  showDemoOption?: boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with"
              shape?: "rectangular" | "pill" | "circle"
              width?: number
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

export function GoogleAuthButton({
  compact = false,
  showDemoOption = true,
}: GoogleAuthButtonProps) {
  const {
    user,
    isLoading,
    syncStatus,
    lastSyncedAt,
    googleClientId,
    setGoogleClientId,
    loginWithGoogle,
    loginWithDemo,
    logout,
  } = useAuth()

  const [showConfig, setShowConfig] = useState(false)
  const [clientIdInput, setClientIdInput] = useState(googleClientId)
  const [isDemoSigningIn, setIsDemoSigningIn] = useState(false)
  const [demoEmail, setDemoEmail] = useState("user@gmail.com")
  const [demoName, setDemoName] = useState("Shrey")
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Load Google Identity Services SDK
  useEffect(() => {
    if (!googleClientId) return

    const existingScript = document.getElementById("google-gsi-client")
    if (!existingScript) {
      const script = document.createElement("script")
      script.id = "google-gsi-client"
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    const checkGsi = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(checkGsi)
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              loginWithGoogle(response.credential)
            }
          },
        })

        googleBtnRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: compact ? "medium" : "large",
          shape: "pill",
          text: "signin_with",
        })
      }
    }, 200)

    return () => clearInterval(checkGsi)
  }, [googleClientId, compact, loginWithGoogle])

  const handleSaveClientId = () => {
    setGoogleClientId(clientIdInput.trim())
    setShowConfig(false)
  }

  const handleDemoSignIn = async () => {
    setIsDemoSigningIn(true)
    await loginWithDemo(demoEmail, demoName)
    setIsDemoSigningIn(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#777080]">
        <Loader2 className="h-4 w-4 animate-spin text-[#9B6CFF]" />
        <span>Connecting…</span>
      </div>
    )
  }

  if (user) {
    if (compact) {
      return (
        <div className="flex items-center gap-2.5">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full border border-[#2B213A] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#21172F] text-xs font-semibold text-[#9B6CFF]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#F4F0FF]">
              {user.name}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#777080]">
              {syncStatus === "syncing" && (
                <>
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-[#9B6CFF]" />
                  <span>Syncing…</span>
                </>
              )}
              {syncStatus === "synced" && (
                <>
                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                  <span>Synced</span>
                </>
              )}
              {syncStatus === "offline" && (
                <>
                  <CloudOff className="h-2.5 w-2.5 text-amber-400" />
                  <span>Local only</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            title="Sign out"
            aria-label="Sign out"
            className="rounded p-1.5 text-[#777080] transition hover:bg-[#1C1628] hover:text-[#FF7AB8]"
          >
            <LogOut size={14} />
          </button>
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-[#2B213A] bg-[#14101D] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-[#2B213A] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#21172F] text-sm font-semibold text-[#9B6CFF]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#F4F0FF]">{user.name}</p>
              <p className="text-xs text-[#9A91AA]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A2433] bg-[#21131D] px-3 py-1.5 text-xs text-[#FFB4D8] transition hover:border-[#FF7AB8]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#211A2B] pt-3 text-xs text-[#777080]">
          <div className="flex items-center gap-1.5">
            {syncStatus === "syncing" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9B6CFF]" />
                <span className="text-[#C7A6FF]">Syncing to cloud…</span>
              </>
            )}
            {syncStatus === "synced" && (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  Cloud synced {lastSyncedAt ? `(${new Date(lastSyncedAt).toLocaleTimeString()})` : ""}
                </span>
              </>
            )}
            {syncStatus === "offline" && (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400">Offline mode — saved locally</span>
              </>
            )}
            {syncStatus === "idle" && (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ready</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-[#5E566A]">Auto-sync active</span>
        </div>
      </div>
    )
  }

  // Not logged in
  return (
    <div className="space-y-3">
      {/* Google GSI button if Client ID exists */}
      {googleClientId ? (
        <div>
          <div ref={googleBtnRef} className="min-h-10" />
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B213A] bg-[#14101D] p-4 text-left">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-[#F4F0FF]">
                <LogIn size={15} className="text-[#9B6CFF]" />
                <span className="text-sm">Sign in with Gmail</span>
              </div>
              <p className="mt-1 text-xs text-[#9A91AA]">
                Back up your habits, tasks, notes & expenses to the cloud and sync
                across your phone and computer.
              </p>
            </div>
          </div>

          {showDemoOption && (
            <div className="mt-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Your Name"
                  className="rounded-lg border border-[#2B213A] bg-[#0F0B17] px-2.5 py-1.5 text-xs text-[#F4F0FF] outline-none placeholder:text-[#6F687A] focus:border-[#9B6CFF]"
                />
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="rounded-lg border border-[#2B213A] bg-[#0F0B17] px-2.5 py-1.5 text-xs text-[#F4F0FF] outline-none placeholder:text-[#6F687A] focus:border-[#9B6CFF]"
                />
              </div>

              <button
                onClick={handleDemoSignIn}
                disabled={isDemoSigningIn}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#9B6CFF] px-3 py-2 text-xs font-semibold text-[#0B0812] transition hover:bg-[#8B56FF] disabled:opacity-50"
              >
                {isDemoSigningIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Gmail (Demo / Local)</span>
              </button>
            </div>
          )}

          <div className="mt-2 text-right">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center gap-1 text-[11px] text-[#777080] hover:text-[#9B6CFF]"
            >
              <Settings2 size={11} />
              <span>{showConfig ? "Hide Google Client ID" : "Configure Google Client ID"}</span>
            </button>
          </div>
        </div>
      )}

      {showConfig && (
        <div className="rounded-xl border border-[#2B213A] bg-[#0F0B17] p-3 text-xs">
          <label className="block text-[#9A91AA]">
            Google OAuth Client ID (from Google Cloud Console):
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              className="flex-1 rounded border border-[#2B213A] bg-[#0A0710] px-2.5 py-1.5 text-xs text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
            />
            <button
              onClick={handleSaveClientId}
              className="rounded bg-[#9B6CFF] px-3 py-1.5 font-medium text-[#0B0812] hover:bg-[#8B56FF]"
            >
              Save
            </button>
          </div>
          <p className="mt-1 text-[10px] text-[#6F687A]">
            Set this once to enable official Google One-Tap & Sign-in.
          </p>
        </div>
      )}
    </div>
  )
}
