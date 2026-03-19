import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DevStateProvider } from "@/contexts/DevStateContext";

import ActiveSessionGuard from "@/components/ActiveSessionGuard";
import InstallGuideBanner from "@/components/InstallGuideBanner";
import BottomNav from "@/components/BottomNav";
import DevModeBadge from "@/components/DevModeBadge";
import { isDemoMode } from "@/lib/demoMode";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { CoupleSpaceProvider } from "@/contexts/CoupleSpaceContext";
import { NormalizedSessionProvider } from "@/contexts/NormalizedSessionContext";
import { OptimisticCompletionsProvider } from "@/contexts/OptimisticCompletionsContext";
import PageTransition from "@/components/PageTransition";
import MobileOnlyGate from "@/components/MobileOnlyGate";

import Index from "./pages/Index";

import Category from "./pages/Category";
import CardView from "./pages/CardView";
import CardPreview from "./pages/CardPreview";
import ProductHome from "./pages/ProductHome";
import KidsCardPortal from "./pages/KidsCardPortal";
import StillUsExplore from "./pages/StillUsExplore";

import SharedSummary from "./pages/SharedSummary";
import Journal from "./pages/Journal";
import Diary from "./pages/Diary";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ScreenshotExport from "./pages/ScreenshotExport";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import { useCaptureController } from "@/hooks/useCaptureController";

// Still Us v2.5 route pages
import {
  CheckInPage,
  CheckInHandoffPage,
  FormatPreviewPage,
  SharePage,
  Tier2SetupPage,
  SessionStartPage,
  Session1CompletePage,
  Session2StartPage,
  Session2LivePage,
  CardCompletePage,
  TillbakaPage,
} from "./pages/still-us-routes";
import CompletionCeremony from "./pages/CompletionCeremony";
import TillbakaSessionLive from "./components/TillbakaSessionLive";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="h-14 border-b border-border bg-card" />
        <div className="px-6 pt-8 space-y-4">
          <div className="h-8 w-48 rounded-lg bg-muted/30 animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted/20 animate-pulse" />
          <div className="mt-6 space-y-3">
            <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
            <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
            <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isDemoMode()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CoupleSpaceProvider>
    <NormalizedSessionProvider>
    <OptimisticCompletionsProvider>
    <AppProvider>
      
      <InstallGuideBanner />
      <ActiveSessionGuard>
        <div style={{ minHeight: '100vh', background: 'transparent' }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              
              <Route path="/categories" element={<Navigate to="/" replace />} />
              <Route path="/still-us/explore" element={<PageTransition><StillUsExplore /></PageTransition>} />
              <Route path="/category/:categoryId" element={<PageTransition><Category /></PageTransition>} />
              <Route path="/card/:cardId" element={<PageTransition><CardView /></PageTransition>} />
              <Route path="/preview/:cardId" element={<PageTransition><CardPreview /></PageTransition>} />
              <Route path="/product/:slug" element={<PageTransition><ProductHome /></PageTransition>} />
              <Route path="/product/:productSlug/portal/:categoryId" element={<PageTransition><KidsCardPortal /></PageTransition>} />
              <Route path="/saved" element={<Navigate to="/journal" replace />} />
              <Route path="/shared" element={<PageTransition><SharedSummary /></PageTransition>} />
              <Route path="/journal" element={<PageTransition><Journal /></PageTransition>} />
              <Route path="/diary/:productId" element={<PageTransition><Diary /></PageTransition>} />

              {/* Still Us v2.5 routes */}
              <Route path="/check-in/:cardId" element={<PageTransition><CheckInPage /></PageTransition>} />
              <Route path="/check-in/:cardId/handoff" element={<PageTransition><CheckInHandoffPage /></PageTransition>} />
              <Route path="/format-preview" element={<PageTransition><FormatPreviewPage /></PageTransition>} />
              <Route path="/share" element={<PageTransition><SharePage /></PageTransition>} />
              <Route path="/tier2-setup" element={<PageTransition><Tier2SetupPage /></PageTransition>} />
              <Route path="/session/:cardId/start" element={<PageTransition><SessionStartPage /></PageTransition>} />
              <Route path="/session/:cardId/complete-session1" element={<PageTransition><Session1CompletePage /></PageTransition>} />
              <Route path="/session/:cardId/session2-start" element={<PageTransition><Session2StartPage /></PageTransition>} />
              <Route path="/session/:cardId/live-session2" element={<PageTransition><Session2LivePage /></PageTransition>} />
              <Route path="/session/:cardId/complete" element={<PageTransition><CardCompletePage /></PageTransition>} />
              <Route path="/session/:cardId/tillbaka" element={<PageTransition><TillbakaSessionLive /></PageTransition>} />
              <Route path="/ceremony" element={<PageTransition><CompletionCeremony /></PageTransition>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </div>
        <BottomNav />
      </ActiveSessionGuard>
    </AppProvider>
    </OptimisticCompletionsProvider>
    </NormalizedSessionProvider>
    </CoupleSpaceProvider>
  );
}



function AppRoutes() {
  const { user, loading } = useAuth();
  // Runs during capture loop — detects __sc_step and auto-advances
  useCaptureController();

  if (loading) {
    return (
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="flex items-center justify-center pt-32">
          <div className="space-y-4 text-center">
            <div className="h-10 w-10 rounded-full bg-muted/30 animate-pulse mx-auto" />
            <div className="h-3 w-24 rounded bg-muted/20 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      {/* Demo param: allow /login to render even without session */}
      <Route path="/screenshot-export" element={<ScreenshotExport />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteSettingsProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner position="bottom-center" offset={{ bottom: 64 }} toastOptions={{ classNames: { toast: 'mx-6' } }} />
          <BrowserRouter>
            <DevStateProvider>
              <MobileOnlyGate>
                <DevModeBadge />
                <AppRoutes />
              </MobileOnlyGate>
            </DevStateProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </QueryClientProvider>
);

export default App;
