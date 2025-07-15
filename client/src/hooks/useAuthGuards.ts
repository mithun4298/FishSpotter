import { useAuth } from "./useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

/**
 * Hook to enforce authentication on any page
 * Automatically redirects to landing page if user is not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect authenticated users away from public pages
 * Automatically redirects to home page if user is already authenticated
 */
export function useRedirectIfAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're not loading and user is authenticated
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return { isAuthenticated, isLoading };
}
