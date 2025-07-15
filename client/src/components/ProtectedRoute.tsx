import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { ReactNode } from "react";
import Splash from "@/pages/splash";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication. If user is not authenticated,
 * redirects to the specified route (default: landing page).
 * 
 * @param children - The components to render if authenticated
 * @param redirectTo - Where to redirect if not authenticated (default: "/")
 */
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
