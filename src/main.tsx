import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import App from "./App.tsx";
import "./index.css";
import "./styles/themes.css";
import "./i18n";

// On native platforms, overlay the WebView under the status bar so that
// `env(safe-area-inset-top)` returns a non-zero value (especially on Android).
// iOS already overlays by default via viewport-fit=cover + black-translucent.
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
}

// Service worker handling:
// - Web: register normally (PWA install / offline support).
// - Native (Capacitor): never register, and proactively unregister any stale
//   SW that a previous build installed inside the WebView. A SW under
//   `https://localhost` intercepts cross-origin fetches in unpredictable ways
//   and was the cause of "Failed to fetch" on every Supabase call from native.
if ("serviceWorker" in navigator) {
  if (Capacitor.isNativePlatform()) {
    navigator.serviceWorker
      .getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {});
  } else {
    import("virtual:pwa-register")
      .then(({ registerSW }) => registerSW({ immediate: true }))
      .catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
