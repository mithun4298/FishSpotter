import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { ReactNode } from "react";
import Splash from "@/pages/splash";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <Splash />;
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}

export default ProtectedRoute;
