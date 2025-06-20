
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBackToSignup: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationComplete,
  onBackToSignup
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        if (error.message.includes('expired')) {
          toast({
            title: "Code Expired",
            description: "Your verification code has expired. Please request a new one.",
            variant: "destructive"
          });
        } else if (error.message.includes('invalid')) {
          toast({
            title: "Invalid Code",
            description: "The verification code you entered is incorrect.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified. You can now sign in.",
        });
        onVerificationComplete();
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "There was an error verifying your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to:
          <br />
          <strong className="text-foreground">{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="verification-code" className="text-center block">
            Enter Verification Code
          </Label>
          <div className="flex justify-center">
            <InputOTP
              value={verificationCode}
              onChange={setVerificationCode}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button 
          onClick={handleVerifyCode}
          className="w-full"
          disabled={isVerifying || verificationCode.length !== 6}
        >
          {isVerifying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Email
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-sm"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification code"
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onBackToSignup}
          className="w-full"
        >
          Back to Sign Up
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
