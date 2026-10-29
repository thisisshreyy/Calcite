import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Check,
  CloudOff,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  X,
} from "lucide-react"
import { useAuth } from "@/state/AuthContext"

type GoogleAuthButtonProps = {
  compact?: boolean
  showDemoOption?: boolean
}

function GoogleLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
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
    googleClientId,
    setGoogleClientId,
    loginWithGoogle,
    loginWithDemo,
    logout,
  } = useAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [clientIdInput, setClientIdInput] = useState(googleClientId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedOrigin, setCopiedOrigin] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Preload Google Identity Services script on mount
  useEffect(() => {
    const existingScript = document.getElementById("google-gsi-client")
    if (!existingScript) {
      const script = document.createElement("script")
      script.id = "google-gsi-client"
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  // Initialize Google Button whenever Client ID is available and modal is open
  useEffect(() => {
    if (!googleClientId || !showLoginModal) return

    const checkGsi = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(checkGsi)
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              if (response.credential) {
                loginWithGoogle(response.credential)
                setShowLoginModal(false)
              }
            },
            auto_select: false,
          })

          googleBtnRef.current.innerHTML = ""
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 320,
          })
        } catch (e) {
          console.error("Google Identity Services initialization error:", e)
        }
      }
    }, 150)

    return () => clearInterval(checkGsi)
  }, [googleClientId, showLoginModal, loginWithGoogle])

  const handleSaveClientId = () => {
    const trimmed = clientIdInput.trim()
    setGoogleClientId(trimmed)
    setShowConfig(false)
  }

  const handleCopyOrigin = () => {
    const origin = window.location.origin
    navigator.clipboard?.writeText(origin)
    setCopiedOrigin(true)
    setTimeout(() => setCopiedOrigin(false), 2000)
  }

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault()
    const email = emailInput.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid Gmail / email address")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")
    const name = nameInput.trim() || email.split("@")[0]

    const success = await loginWithDemo(email, name)
    setIsSubmitting(false)
    if (success) {
      setShowLoginModal(false)
    } else {
      setErrorMsg("Could not connect to cloud sync server. Make sure the backend is running.")
    }
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
        <div className="flex items-center gap-2.5 rounded-xl border border-[#2B213A] bg-[#14101D] p-2.5">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-8 w-8 rounded-full border border-[#2B213A] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#21172F] text-xs font-semibold text-[#9B6CFF]">
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
              {syncStatus === "idle" && (
                <>
                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                  <span>Active</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            title="Sign out"
            aria-label="Sign out"
            className="rounded p-1 text-[#777080] transition hover:bg-[#251724] hover:text-[#FF7AB8]"
          >
            <LogOut size={14} />
          </button>
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-4">
        <div className="flex items-center justify-between">
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
              <p className="text-xs text-[#777080]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            className="flex items-center gap-1.5 rounded-xl border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-xs text-[#777080] transition hover:border-[#FF7AB8] hover:text-[#FF7AB8]"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className={`flex w-full items-center justify-center gap-2.5 rounded-xl transition ${
          compact
            ? "border border-[#2B213A] bg-[#14101D] px-3 py-2.5 text-xs font-medium text-[#F4F0FF] hover:border-[#9B6CFF] hover:bg-[#1C1628]"
            : "bg-[#9B6CFF] px-4 py-3 text-sm font-semibold text-[#0B0812] hover:bg-[#8B56FF]"
        }`}
      >
        <GoogleLogo className="h-4 w-4" />
        <span>Sign in with Google</span>
      </button>

      {/* Modal Dialog */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[#2B213A] bg-[#14101D] p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#211A2B] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#21172F]">
                  <GoogleLogo className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F4F0FF]">Google Authentication</h3>
                  <p className="text-xs text-[#9A91AA]">Cloud sync across all your devices</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-1.5 text-[#777080] hover:bg-[#21172F] hover:text-[#F4F0FF]"
              >
                <X size={18} />
              </button>
            </div>

            {/* SECTION 1: Google OAuth Flow */}
            <div className="mt-5 space-y-3">
              {googleClientId ? (
                <div>
                  <p className="text-center text-xs text-[#9A91AA] mb-3">
                    Continue with your verified Google Account:
                  </p>
                  <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowConfig(true)}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#3A2D4F] bg-[#1B1327] py-3 text-sm font-medium text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#231834]"
                  >
                    <GoogleLogo className="h-5 w-5" />
                    <span>Continue with Google OAuth</span>
                  </button>

                  {/* Config Drawer for Google Client ID */}
                  {showConfig && (
                    <div className="mt-3 rounded-xl border border-[#3B2956] bg-[#0E0A16] p-4 text-xs text-[#9A91AA] animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-[#F4F0FF] font-medium mb-1.5">
                        <KeyRound size={15} className="text-[#9B6CFF]" />
                        <span>Connect Google Cloud Console</span>
                      </div>
                      <p className="leading-relaxed text-[11px] text-[#777080]">
                        Google requires an <strong>OAuth 2.0 Client ID</strong> to show the official Google login popup.
                      </p>

                      <div className="mt-3 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between rounded-lg bg-[#14101D] p-2 border border-[#211A2B]">
                          <span className="text-[#777080]">Your Authorized Origin:</span>
                          <button
                            type="button"
                            onClick={handleCopyOrigin}
                            className="font-mono text-[#C7A6FF] hover:underline flex items-center gap-1"
                          >
                            <span>{window.location.origin}</span>
                            <span className="text-[10px] text-emerald-400">{copiedOrigin ? "✓ Copied" : "Copy"}</span>
                          </button>
                        </div>

                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#9B6CFF] hover:underline"
                        >
                          <span>Open Google Cloud Credentials</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={clientIdInput}
                          onChange={(e) => setClientIdInput(e.target.value)}
                          placeholder="Paste Client ID here (...apps.googleusercontent.com)"
                          className="flex-1 rounded-lg border border-[#2B213A] bg-[#14101D] px-2.5 py-2 text-xs text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
                        />
                        <button
                          type="button"
                          onClick={handleSaveClientId}
                          className="rounded-lg bg-[#9B6CFF] px-3.5 py-2 text-xs font-semibold text-[#0B0812] hover:bg-[#8B56FF]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#211A2B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E566A]">
                Or Sign In Directly
              </span>
              <div className="h-px flex-1 bg-[#211A2B]" />
            </div>

            {/* SECTION 2: Direct Gmail Sign-In (Instant / No Cloud Console needed) */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#9A91AA]">
                  Gmail Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3 text-[#5E566A]" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full rounded-xl border border-[#2B213A] bg-[#0F0B17] py-2.5 pl-9 pr-3.5 text-xs text-[#F4F0FF] outline-none placeholder:text-[#5E566A] focus:border-[#9B6CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#9A91AA]">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Shrey"
                  className="w-full rounded-xl border border-[#2B213A] bg-[#0F0B17] px-3.5 py-2 text-xs text-[#F4F0FF] outline-none placeholder:text-[#5E566A] focus:border-[#9B6CFF]"
                />
              </div>

              {errorMsg && (
                <p className="rounded-lg bg-[#2A1520] p-2.5 text-xs text-[#FF7AB8]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9B6CFF] py-2.5 text-xs font-semibold text-[#0B0812] transition hover:bg-[#8B56FF] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogIn size={15} />
                )}
                <span>Sign In & Sync Now</span>
              </button>
            </form>

            {/* Quick Demo Option */}
            {showDemoOption && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("calcite.user@gmail.com")
                    setNameInput("Calcite User")
                  }}
                  className="text-[11px] text-[#777080] hover:text-[#C7A6FF]"
                >
                  ⚡ Fill demo account (calcite.user@gmail.com)
                </button>
              </div>
            )}

            {/* Footer Help */}
            <div className="mt-4 border-t border-[#211A2B] pt-3 text-center">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="inline-flex items-center gap-1 text-[11px] text-[#6F687A] hover:text-[#9A91AA]"
              >
                <HelpCircle size={11} />
                <span>Configure Google Client ID</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
