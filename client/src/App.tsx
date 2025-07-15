import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Splash from "@/pages/splash";
import { useState, useEffect } from "react";

/**
 * Main Router Component
 * 
 * Handles all application routing with comprehensive authentication guards:
 * - Shows splash screen on initial load
 * - Protects authenticated routes
 * - Redirects unauthenticated users to landing page
 * - Prevents authenticated users from accessing auth pages
 */
function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for 3 seconds on app load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Switch>
      {/* Root route - Landing page for unauthenticated, Home for authenticated */}
      <Route path="/">
        {!isAuthenticated ? <Landing /> : <ProtectedRoute><Home /></ProtectedRoute>}
      </Route>

      {/* Protected routes - only accessible when authenticated */}
      <Route path="/home">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>

      {/* Fallback - always redirect unauthenticated users to landing */}
      <Route>
        {isLoading ? (
          <Splash />
        ) : !isAuthenticated ? (
          <Landing />
        ) : (
          <NotFound />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
