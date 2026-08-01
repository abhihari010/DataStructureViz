import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Mail, LayoutDashboard } from "lucide-react";
import { getApiErrorMessage, passwordReset } from "@/lib/api";

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsLoading(true);
    sessionStorage.removeItem("passwordResetProof");
    
    try {
      await passwordReset.request(data.email.trim());
      
      // Show success message and set submitted state
      setIsSubmitted(true);
      
      toast({
        title: "OTP Sent",
              description: "If an account exists, a 6-digit OTP will arrive shortly.",
      });
      
      // Navigate to OTP verification page with email as URL parameter after a short delay
      setTimeout(() => {
        setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err, 'Unable to process that request. Please try again.');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">DSA Visualizer</h2>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-center">
              If an account exists, check your email for the reset code.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              If you don't see the email, check your spam folder or try again.
            </p>
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setLocation('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">DSA Visualizer</h2>
          </div>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                disabled={isLoading}
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
            
            <Button 
              className="w-full" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/login")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
