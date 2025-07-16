import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AuthForm {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * AuthModal Component
 * 
 * Modal authentication system that overlays on the landing page.
 * Provides login, signup, and forgot password functionality without page navigation.
 * 
 * Features:
 * - Backdrop blur effect
 * - Mobile-responsive design
 * - Smooth animations
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 * - All authentication flows in one modal
 */
export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  // Component state
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState<AuthForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication mutation (login/signup)
  const authMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Authentication failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: isLogin ? "Welcome back!" : "Account created successfully!",
      });
      // Close modal and trigger success callback
      onClose();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
      setShowForgotPassword(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate(formData);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(formData.email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Reset form state when modal closes
  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    });
    setIsLogin(true);
    setShowForgotPassword(false);
    onClose();
  };

  // Add keyboard event listener and focus management
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      
      // Focus management - focus first input when modal opens
      const firstInput = document.querySelector('#auth-modal input') as HTMLInputElement;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLogin, showForgotPassword]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with enhanced blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md animate-slide-in"
        id="auth-modal"
      >
        <Card className="w-full modern-card shadow-glass border-ocean-700">
          <CardHeader className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-ocean-200 hover:text-white hover:bg-ocean-800"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            
            <CardTitle className="pr-8 gradient-text">
              {showForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
            </CardTitle>
            <CardDescription className="text-ocean-200">
              {showForgotPassword 
                ? "Enter your email to receive reset instructions"
                : (isLogin 
                  ? "Sign in to your FishSpotter account" 
                  : "Join FishSpotter to identify fish species")
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    className="bg-ocean-900 border-ocean-700 text-white placeholder:text-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full modern-button"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending 
                    ? "Sending..." 
                    : "Send Reset Link"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full text-ocean-200 hover:text-white hover:bg-ocean-800"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required={!isLogin}
                          autoFocus={!isLogin}
                          className="bg-ocean-900 border-ocean-700 text-white placeholder:text-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required={!isLogin}
                          className="bg-ocean-900 border-ocean-700 text-white placeholder:text-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoFocus={isLogin}
                      className="bg-ocean-900 border-ocean-700 text-white placeholder:text-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-ocean-900 border-ocean-700 text-white placeholder:text-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full modern-button shadow-glow"
                    disabled={authMutation.isPending}
                  >
                    {authMutation.isPending 
                      ? "Please wait..." 
                      : (isLogin ? "Sign In" : "Create Account")}
                  </Button>
                </form>
                
                {/* Google OAuth Section - Only show for login/signup, not forgot password */}
                {!showForgotPassword && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-ocean-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-ocean-900 px-2 text-ocean-300">Or continue with</span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-ocean-600 bg-ocean-800 text-white hover:bg-ocean-700 hover:border-ocean-500 transition-all duration-300"
                      onClick={() => {
                        // Redirect to Google OAuth
                        window.location.href = "/auth/google";
                      }}
                    >
                      <GoogleIcon />
                      <span className="ml-2">Continue with Google</span>
                    </Button>
                  </>
                )}
                
                <div className="mt-4 text-center space-y-2">
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-ocean-400 hover:text-ocean-300 hover:underline block w-full transition-colors duration-200"
                    >
                      Forgot your password?
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-ocean-400 hover:text-ocean-300 hover:underline transition-colors duration-200"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuthModal;
