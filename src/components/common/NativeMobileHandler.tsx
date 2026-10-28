import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { App as CapApp } from "@capacitor/app"
import { StatusBar, Style } from "@capacitor/status-bar"
import { useNavigate, useLocation } from "react-router-dom"

export function NativeMobileHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // Style native status bar on Android
    StatusBar.setBackgroundColor({ color: "#0B0812" }).catch(() => {})
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

    // Handle hardware back button
    let subPromise: ReturnType<typeof CapApp.addListener> | null = null

    try {
      subPromise = CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack && location.pathname !== "/") {
          navigate(-1)
        } else {
          CapApp.exitApp().catch(() => {})
        }
      })
    } catch {
      // Ignore if unsupported
    }

    return () => {
      subPromise?.then((sub) => sub.remove()).catch(() => {})
    }
  }, [navigate, location])

  return null
}
