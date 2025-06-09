import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          throw new Error("No verification token found");
        }

        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setIsSuccess(true);
        toast({
          title: "Success!",
          description: data.message,
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: error instanceof Error ? error.message : "Could not verify email",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [setLocation, toast]);

  const handleResendEmail = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");

      if (!email) {
        throw new Error("Email not found");
      }

      const response = await fetch(`/api/auth/resend-verification?email=${email}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not resend verification email");
      }

      toast({
        title: "Success!",
        description: data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not resend verification email",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {isVerifying
              ? "Verifying your email..."
              : isSuccess
              ? "Email verified successfully!"
              : "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {isVerifying ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : isSuccess ? (
            <div className="text-center">
              <p className="mb-4">You will be redirected to login shortly...</p>
              <Button onClick={() => setLocation("/login")}>Go to Login</Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p>The verification link may have expired.</p>
              <Button onClick={handleResendEmail}>Resend Verification Email</Button>
              <div className="pt-2">
                <Button variant="ghost" onClick={() => setLocation("/login")}>
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 