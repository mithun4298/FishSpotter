import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Splash from "@/pages/splash";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

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
      {/* Public routes - only accessible when NOT authenticated */}
      <Route path="/">
        {!isAuthenticated ? <Landing /> : <ProtectedRoute><Home /></ProtectedRoute>}
      </Route>
      
      <Route path="/auth">
        <PublicRoute>
          <Auth />
        </PublicRoute>
      </Route>

      {/* Protected routes - only accessible when authenticated */}
      <Route path="/home">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>

      {/* Fallback for unauthenticated users - always redirect to landing */}
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
