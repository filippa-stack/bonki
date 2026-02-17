import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DevStateProvider } from "@/contexts/DevStateContext";
import RemoteCardCue from "@/components/RemoteCardCue";
import ActiveSessionGuard from "@/components/ActiveSessionGuard";
import DevModeBadge from "@/components/DevModeBadge";
import ProposalAcceptanceWatcher from "@/components/ProposalAcceptanceWatcher";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Category from "./pages/Category";
import CardView from "./pages/CardView";
import SavedConversations from "./pages/SavedConversations";
import SharedSummary from "./pages/SharedSummary";
import Login from "./pages/Login";
import JoinSpace from "./pages/JoinSpace";
import NotFound from "./pages/NotFound";
import { storePendingInvite } from "@/hooks/usePendingInvite";

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
    <AppProvider>
      <RemoteCardCueGlobal />
      <ProposalAcceptanceWatcher />
      <ActiveSessionGuard>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/category/:categoryId" element={<PageTransition><Category /></PageTransition>} />
            <Route path="/card/:cardId" element={<PageTransition><CardView /></PageTransition>} />
            <Route path="/saved" element={<PageTransition><SavedConversations /></PageTransition>} />
            <Route path="/shared" element={<PageTransition><SharedSummary /></PageTransition>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </ActiveSessionGuard>
    </AppProvider>
  );
}

function RemoteCardCueGlobal() {
  const { remoteCardChanged, dismissRemoteCardCue } = useApp();
  return <RemoteCardCue show={remoteCardChanged} onDone={dismissRemoteCardCue} />;
}

function JoinRedirectGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const code = searchParams.get('code');

  // Store invite params in useEffect to avoid side-effects during render
  useEffect(() => {
    if (token || code) {
      storePendingInvite(token, code);
    }
  }, [token, code]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full bg-muted/30 animate-pulse" />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace state={{ returnTo: '/join' + location.search }} />;
  }

  return (
    <AppProvider>
      <JoinSpace />
    </AppProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

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
      <Route path="/join" element={<JoinRedirectGuard />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteSettingsProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <DevStateProvider>
              <DevModeBadge />
              <AppRoutes />
            </DevStateProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </QueryClientProvider>
);

export default App;
