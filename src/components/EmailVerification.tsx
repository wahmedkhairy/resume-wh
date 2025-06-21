
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";

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
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendLink = async () => {
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
        title: "Verification Link Sent",
        description: "A new verification link has been sent to your email.",
      });
    } catch (error: any) {
      console.error('Resend link error:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Failed to resend verification link. Please try again.",
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
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to:
          <br />
          <strong className="text-foreground">{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <ExternalLink className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Please check your email and click the verification link to activate your account.
            </p>
            <p className="text-xs text-gray-500">
              The link will redirect you back to our website once verified.
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">After clicking the verification link, you'll be able to sign in with your credentials.</p>
            <p className="text-xs text-gray-500">
              Don't forget to check your spam/junk folder if you don't see the email.
            </p>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?
          </p>
          <Button
            variant="outline"
            onClick={handleResendLink}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification link"
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
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
