import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const emailParam = params.get("email");
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      verifyEmail(token);
    }
  }, []);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${apiBase}/auth/verify?token=${token}`);
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

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsResending(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(
        `${apiBase}/auth/resend-verification?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
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
    } finally {
      setIsResending(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {token 
              ? (isVerifying
                ? "Verifying your email..."
                : isSuccess
                ? "Email verified successfully!"
                : "Email verification failed")
              : "Enter your email to resend verification"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {token ? (
            // Show verification status
            isVerifying ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : isSuccess ? (
              <div className="text-center">
                <p className="mb-4">You will be redirected to login shortly...</p>
                <Button onClick={() => setLocation("/login")}>Go to Login</Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p>The verification link may have expired.</p>
                <Button onClick={handleResendEmail} disabled={isResending}>
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <div className="pt-2">
                  <Button variant="ghost" onClick={() => setLocation("/login")}>
                    Back to Login
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Show email input for resending
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isResending}
                />
              </div>
              <Button 
                onClick={handleResendEmail} 
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <div className="pt-2">
                <Button variant="ghost" onClick={() => setLocation("/login")} className="w-full">
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