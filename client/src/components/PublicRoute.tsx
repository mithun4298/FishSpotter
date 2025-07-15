import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { ReactNode } from "react";
import Splash from "@/pages/splash";

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = "/" }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <Splash />;
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Render public content if not authenticated
  return <>{children}</>;
}

export default PublicRoute;
