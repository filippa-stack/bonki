import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
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

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppProvider>
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
    </AppProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/join" element={user ? <JoinSpace /> : <Navigate to="/login" replace state={{ returnTo: '/join' + window.location.search }} />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteSettingsProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </QueryClientProvider>
);

export default App;
