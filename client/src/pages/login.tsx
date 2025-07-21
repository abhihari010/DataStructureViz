import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";
import { ChartGantt } from "lucide-react";
import { Loader2 } from "lucide-react";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading, isAuthTransitioning } = useAuthJWT();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
    resetField,
    setValue,
    watch
  } = useForm<LoginFormData>();

  const watchedEmail = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsEmailNotVerified(false);
    
    try {
      await login(data);
      // The onSuccess in useAuthJWT will handle the redirect
    } catch (error: any) {
      // Clear the password field on error
      resetField('password');
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Check if this is an email verification error
        if (errorMessage.includes("verify your email")) {
          setIsEmailNotVerified(true);
          setUserEmail(data.email);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      
      setServerError(errorMessage);
      
      // Scroll to top to show the error
      window.scrollTo(0, 0);
      
      // Show toast for non-401 errors
      if (error?.response?.status !== 401) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorMessage,
        });
      }
    }
  }

  const handleResendVerification = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(
        `${apiBase}/auth/resend-verification?email=${encodeURIComponent(userEmail)}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not resend verification email");
      }

      toast({
        title: "Verification Email Sent!",
        description: "Please check your email and click the verification link.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not resend verification email",
      });
    }
  };

  if (isLoading || isAuthTransitioning) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <ChartGantt className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">DSA Visualizer</h2>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <Alert variant={isEmailNotVerified ? "default" : "destructive"} className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isEmailNotVerified ? (
                    <div className="space-y-2">
                      <p>Please verify your email before logging in.</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Resend Verification Email
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/verify-email?email=${encodeURIComponent(userEmail)}`)}
                        >
                          Verify Email
                        </Button>
                      </div>
                    </div>
                  ) : (
                    serverError
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                disabled={isSubmitting}
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                aria-invalid={errors.email ? 'true' : 'false'}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => setLocation('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                disabled={isSubmitting}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                aria-invalid={errors.password ? 'true' : 'false'}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              className="w-full" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => setLocation("/register")}
            >
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}