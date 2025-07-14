import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import axios from "axios";

export default function VerifyOtp() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resendTime, setResendTime] = useState(60);

  useEffect(() => {
    // Parse email from URL parameters
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (!emailParam) {
      // If no email in URL, redirect back to forgot password
      setLocation('/forgot-password');
      return;
    }
    setEmail(decodeURIComponent(emailParam));

    // Setup resend timer
    const timer = setInterval(() => {
      setResendTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [location, setLocation]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    try {
      await axios.post(`${apiBase}/forgot-password/verifyOtp/${otp}/${email}`);
      
      // Navigate to reset password page with email as URL parameter
      setLocation(`/reset-password?email=${encodeURIComponent(email)}`);
      
      toast({
        title: "OTP Verified",
        description: "Please set your new password.",
      });
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      const errorMessage = err.response?.data || 'Invalid or expired OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTime > 0) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    try {
      await axios.post(`${apiBase}/forgot-password/sendMail/${email}`);
      setResendTime(60);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
      });
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit p-0 mb-2"
            onClick={() => setLocation('/forgot-password')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email || 'your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="text-center text-xl font-mono tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTime > 0}
                className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTime > 0 ? `Resend in ${resendTime}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
