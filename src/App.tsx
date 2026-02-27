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
import DevModeBadge from "@/components/DevModeBadge";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { CoupleSpaceProvider } from "@/contexts/CoupleSpaceContext";
import { NormalizedSessionProvider } from "@/contexts/NormalizedSessionContext";
import { OptimisticCompletionsProvider } from "@/contexts/OptimisticCompletionsContext";
import PageTransition from "@/components/PageTransition";
import MobileOnlyGate from "@/components/MobileOnlyGate";
import BackgroundWatermark from "@/components/BackgroundWatermark";
import Index from "./pages/Index";


import Category from "./pages/Category";
import CardView from "./pages/CardView";
import ProductHome from "./pages/ProductHome";

import SharedSummary from "./pages/SharedSummary";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ScreenshotExport from "./pages/ScreenshotExport";
import { useCaptureController } from "@/hooks/useCaptureController";

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CoupleSpaceProvider>
    <NormalizedSessionProvider>
    <OptimisticCompletionsProvider>
    <AppProvider>
      
      <InstallGuideBanner />
      <ActiveSessionGuard>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            
            <Route path="/categories" element={<Navigate to="/" replace />} />
            <Route path="/category/:categoryId" element={<PageTransition><Category /></PageTransition>} />
            <Route path="/card/:cardId" element={<PageTransition><CardView /></PageTransition>} />
            <Route path="/product/:slug" element={<PageTransition><ProductHome /></PageTransition>} />
            <Route path="/saved" element={<Navigate to="/shared" replace />} />
            <Route path="/shared" element={<PageTransition><SharedSummary /></PageTransition>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
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
      <Route path="/screenshot-export" element={<ScreenshotExport />} />
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
                <BackgroundWatermark />
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
