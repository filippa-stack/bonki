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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
