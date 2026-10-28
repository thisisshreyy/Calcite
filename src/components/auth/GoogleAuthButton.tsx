import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Check,
  Cloud,
  CloudOff,
  HelpCircle,
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

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [clientIdInput, setClientIdInput] = useState(googleClientId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Load Google Identity Services SDK if Client ID is configured
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
              setShowLoginModal(false)
            }
          },
        })

        googleBtnRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
        })
      }
    }, 200)

    return () => clearInterval(checkGsi)
  }, [googleClientId, loginWithGoogle])

  const handleSaveClientId = () => {
    setGoogleClientId(clientIdInput.trim())
    setShowConfig(false)
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
      <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-11 w-11 rounded-full border border-[#2B213A] object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#21172F] text-sm font-semibold text-[#9B6CFF]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-[#F4F0FF]">{user.name}</p>
              <p className="text-xs text-[#9A91AA]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#3A2433] bg-[#21131D] px-3.5 py-2 text-xs font-medium text-[#FFB4D8] transition hover:border-[#FF7AB8] hover:bg-[#2A1724]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#211A2B] pt-3 text-xs text-[#777080]">
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
                  Cloud synced {lastSyncedAt ? `(${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ""}
                </span>
              </>
            )}
            {syncStatus === "offline" && (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400">Offline mode — saved locally on device</span>
              </>
            )}
            {syncStatus === "idle" && (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cloud connected & auto-sync active</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-[#6F687A]">Multi-device ready</span>
        </div>
      </div>
    )
  }

  // Not logged in
  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl transition ${
          compact
            ? "border border-[#2B213A] bg-[#14101D] px-3 py-2.5 text-xs font-medium text-[#F4F0FF] hover:border-[#9B6CFF] hover:bg-[#1C1628]"
            : "bg-[#9B6CFF] px-4 py-3 text-sm font-semibold text-[#0B0812] hover:bg-[#8B56FF]"
        }`}
      >
        <Mail size={16} className={compact ? "text-[#9B6CFF]" : "text-[#0B0812]"} />
        <span>Sign in with Gmail</span>
      </button>

      {/* Modal Dialog */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#2B213A] bg-[#14101D] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#211A2B]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#21172F] text-[#9B6CFF]">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F4F0FF]">Sign in with Gmail</h3>
                  <p className="text-xs text-[#9A91AA]">Cloud sync across phone & PC</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-1.5 text-[#777080] hover:bg-[#21172F] hover:text-[#F4F0FF]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEmailSignIn} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#9A91AA] mb-1">
                  Gmail / Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. shreyy@gmail.com"
                  className="w-full rounded-xl border border-[#2B213A] bg-[#0F0B17] px-3.5 py-2.5 text-sm text-[#F4F0FF] outline-none placeholder:text-[#5E566A] focus:border-[#9B6CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9A91AA] mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Shrey"
                  className="w-full rounded-xl border border-[#2B213A] bg-[#0F0B17] px-3.5 py-2.5 text-sm text-[#F4F0FF] outline-none placeholder:text-[#5E566A] focus:border-[#9B6CFF]"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9B6CFF] py-2.5 text-sm font-semibold text-[#0B0812] transition hover:bg-[#8B56FF] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                <span>Sign In & Sync Now</span>
              </button>
            </form>

            {/* Google OAuth One-Tap button if configured */}
            {googleClientId && (
              <div className="mt-5 border-t border-[#211A2B] pt-4 text-center">
                <p className="text-xs text-[#777080] mb-3">Or continue with Google One-Tap</p>
                <div ref={googleBtnRef} className="flex justify-center" />
              </div>
            )}

            {/* Quick Demo Test Option */}
            {showDemoOption && (
              <div className="mt-4 border-t border-[#211A2B] pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("calcite.user@gmail.com")
                    setNameInput("Calcite User")
                  }}
                  className="text-xs text-[#9B6CFF] hover:underline"
                >
                  ⚡ Fill demo account (calcite.user@gmail.com)
                </button>
              </div>
            )}

            {/* Explanation of Client ID */}
            <div className="mt-4 border-t border-[#211A2B] pt-3">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 text-[11px] text-[#6F687A] hover:text-[#9A91AA]"
              >
                <HelpCircle size={12} />
                <span>What is a Google Client ID? (Optional)</span>
              </button>

              {showConfig && (
                <div className="mt-2.5 rounded-xl border border-[#2B213A] bg-[#0A0710] p-3 text-xs text-[#9A91AA]">
                  <p className="leading-relaxed">
                    A <strong>Google Client ID</strong> is only needed if you want the official Google login popup with Google Cloud Console. 
                    You <strong>don't</strong> need it: typing your Gmail above automatically connects and backs up your data!
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      placeholder="Paste Client ID here if you have one"
                      className="flex-1 rounded-lg border border-[#2B213A] bg-[#14101D] px-2.5 py-1.5 text-xs text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClientId}
                      className="rounded-lg bg-[#9B6CFF] px-3 py-1.5 text-xs font-semibold text-[#0B0812]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
