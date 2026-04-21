import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { trackPixelEvent } from "@/lib/metaPixel";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DevStateProvider } from "@/contexts/DevStateContext";

import ActiveSessionGuard from "@/components/ActiveSessionGuard";
import InstallGuideBanner from "@/components/InstallGuideBanner";
import BonkiLoadingScreen from "@/components/BonkiLoadingScreen";
import { useRouteTheme } from "@/hooks/useRouteTheme";
import BottomNav from "@/components/BottomNav";
import DevModeBadge from "@/components/DevModeBadge";
import { isDemoMode } from "@/lib/demoMode";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { CoupleSpaceProvider, useCoupleSpaceContext } from "@/contexts/CoupleSpaceContext";
import { NormalizedSessionProvider, useNormalizedSessionContext } from "@/contexts/NormalizedSessionContext";
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
// Install page removed — route redirects to /login
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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BuyPage from "./pages/BuyPage";
import ClaimPage from "./pages/ClaimPage";

const queryClient = new QueryClient();

function ProtectedContent() {
  const { loading: spaceLoading } = useCoupleSpaceContext();
  const { loading: sessionLoading } = useNormalizedSessionContext();
  const hasContentRendered = useRef(false);

  if (!hasContentRendered.current && (spaceLoading || sessionLoading)) {
    return <BonkiLoadingScreen />;
  }
  hasContentRendered.current = true;

  return (
    <>
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
            <Route path="/session/:cardId/complete" element={<CardCompletePage />} />
            <Route path="/session/:cardId/tillbaka" element={<TillbakaPage />} />
            <Route path="/session/:cardId/tillbaka-complete" element={<TillbakaComplete />} />
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
    </>
  );
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hasProtectedRendered = useRef(false);

  if (loading && !hasProtectedRendered.current) {
    return <BonkiLoadingScreen />;
  }
  hasProtectedRendered.current = true;

  if (!user && !isDemoMode()) {
    const loginPath = `/login${location.search}`;
    return <Navigate to={loginPath} replace />;
  }

  return (
    <CoupleSpaceProvider>
      <NormalizedSessionProvider>
        <OptimisticCompletionsProvider>
          <AppProvider>
            <ProtectedContent />
          </AppProvider>
        </OptimisticCompletionsProvider>
      </NormalizedSessionProvider>
    </CoupleSpaceProvider>
  );
}



function RoutePageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPixelEvent('PageView');
  }, [location.pathname]);
  return null;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const hasAppRendered = useRef(false);
  useCaptureController();
  useRouteTheme();

  if (loading && !hasAppRendered.current) {
    return <BonkiLoadingScreen />;
  }

  hasAppRendered.current = true;

  return (
    <Routes>
      <Route path="/login" element={
        user && !new URLSearchParams(window.location.search).has('devState')
          ? <Navigate to="/" replace />
          : <Login />
      } />
      <Route path="/install" element={<Navigate to="/login" replace />} />
      <Route path="/screenshot-export" element={<ScreenshotExport />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/buy" element={<BuyPage />} />
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
                <RoutePageViewTracker />
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
