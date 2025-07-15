import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AuthForm {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState<AuthForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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
      // Redirect to fish identification page after authentication
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {showForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
          </CardTitle>
          <CardDescription>
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
            // Forgot Password Form
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending 
                  ? "Sending..." 
                  : "Send Reset Link"}
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          ) : (
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
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending 
                  ? "Please wait..." 
                  : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline block w-full"
                >
                  Forgot your password?
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
