import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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

import MobileOnlyGate from "@/components/MobileOnlyGate";
import BonkiErrorBoundary from "@/components/BonkiErrorBoundary";

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

// Still Us route pages (kept: ceremony, journey, paywall, solo-reflect, dissolution)
import {
  CardCompletePage,
  TillbakaPage,
} from "./pages/still-us-routes";
import SuIntroPortal from "./pages/still-us-routes/SuIntroPortal";
import CompletionCeremony from "./pages/CompletionCeremony";
import TillbakaSessionLiveComponent from "./components/TillbakaSessionLive";
import TillbakaComplete from "./pages/TillbakaComplete";
import Journey from "./pages/Journey";
import Paywall from "./pages/Paywall";
import PaywallFullScreen from "./pages/PaywallFullScreen";
import SoloReflect from "./pages/SoloReflect";
import JourneyPreview from "./pages/JourneyPreview";
import DissolutionSettings from "./pages/DissolutionSettings";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen page-bg animate-fade-in loading-skeleton">
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
    // Preserve query params (e.g. ?demo=1) when redirecting to login
    const loginPath = `/login${location.search}`;
    return <Navigate to={loginPath} replace />;
  }

  return (
    <CoupleSpaceProvider>
    <NormalizedSessionProvider>
    <OptimisticCompletionsProvider>
    <AppProvider>
      
      <InstallGuideBanner />
      <ActiveSessionGuard>
        <div style={{ minHeight: '100vh', background: 'var(--page-bg, #0B1026)' }}>
            <Routes>
              <Route path="/" element={<Index />} />
              
              <Route path="/categories" element={<Navigate to="/" replace />} />
              <Route path="/still-us/explore" element={<StillUsExplore />} />
              <Route path="/still-us/intro" element={<SuIntroPortal />} />
              <Route path="/category/:categoryId" element={<Category />} />
              <Route path="/card/:cardId" element={<CardView />} />
              <Route path="/preview/:cardId" element={<CardPreview />} />
              <Route path="/product/:slug" element={<ProductHome />} />
              <Route path="/product/:productSlug/portal/:categoryId" element={<KidsCardPortal />} />
              <Route path="/saved" element={<Navigate to="/journal" replace />} />
              <Route path="/shared" element={<SharedSummary />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/diary/:productId" element={<Diary />} />

              {/* Still Us: only card-complete and tillbaka routes kept */}
              <Route path="/session/:cardId/complete" element={<CardCompletePage />} />
              <Route path="/session/:cardId/tillbaka" element={<TillbakaPage />} />
              <Route path="/session/:cardId/tillbaka-complete" element={<TillbakaComplete />} />

              {/* Legacy Still Us routes → redirect to product home */}
              <Route path="/check-in/*" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/share" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/format-preview" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/tier2-setup" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/session/:cardId/start" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/session/:cardId/complete-session1" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/session/:cardId/session2-start" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/session/:cardId/live-session2" element={<Navigate to="/product/still-us" replace />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/solo-reflect/:cardId" element={<SoloReflect />} />
              <Route path="/journey-preview" element={<JourneyPreview />} />
              <Route path="/unlock" element={<Paywall />} />
              <Route path="/paywall-full" element={<PaywallFullScreen />} />
              <Route path="/ceremony" element={<CompletionCeremony />} />
              <Route path="/settings/dissolve" element={<DissolutionSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
      <div className="min-h-screen page-bg animate-fade-in loading-skeleton">
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
  <BonkiErrorBoundary>
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
  </BonkiErrorBoundary>
);

export default App;
