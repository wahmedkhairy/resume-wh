import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { AlertCircle, Eye, EyeOff, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmailVerification from "@/components/EmailVerification";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is a password reset callback
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    console.log('URL params:', { type, accessToken: !!accessToken, refreshToken: !!refreshToken });
    
    if (type === 'recovery' && accessToken && refreshToken) {
      console.log('Password reset callback detected');
      // Set the session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "Password Reset Error",
            description: "Invalid or expired reset link. Please request a new one.",
            variant: "destructive",
          });
        } else {
          console.log('Session set successfully for password reset');
          setIsPasswordReset(true);
          toast({
            title: "Password Reset",
            description: "Please enter your new password below.",
          });
        }
      });
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle successful authentication
        if (event === 'SIGNED_IN' && session?.user && !isPasswordReset) {
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
          navigate("/");
        }
        
        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }

        // Handle password recovery
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event detected');
          setIsPasswordReset(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialLoading(false);
      
      if (session?.user && !isPasswordReset) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, searchParams, isPasswordReset]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({
        title: "Invalid Password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });
      
      // Clear the reset state and redirect
      setIsPasswordReset(false);
      setNewPassword("");
      setConfirmNewPassword("");
      
      // Sign out to force fresh login
      await supabase.auth.signOut();
      
      // Clear URL parameters
      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Password Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const canAttemptReset = () => {
    if (!lastResetAttempt) return true;
    const timeSinceLastAttempt = Date.now() - lastResetAttempt;
    const minimumWaitTime = 60000; // 60 seconds
    return timeSinceLastAttempt >= minimumWaitTime;
  };

  const getRemainingWaitTime = () => {
    if (!lastResetAttempt) return 0;
    const timeSinceLastAttempt = Date.now() - lastResetAttempt;
    const minimumWaitTime = 60000; // 60 seconds
    return Math.max(0, Math.ceil((minimumWaitTime - timeSinceLastAttempt) / 1000));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(forgotPasswordEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!canAttemptReset()) {
      const remainingTime = getRemainingWaitTime();
      toast({
        title: "Please Wait",
        description: `You can try again in ${remainingTime} seconds to avoid rate limits.`,
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    setLastResetAttempt(Date.now());
    console.log('Attempting password reset for:', forgotPasswordEmail);

    try {
      // Use the current domain for the redirect URL
      const redirectUrl = `${window.location.origin}/auth`;
      console.log('Reset redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: redirectUrl,
      });

      console.log('Reset password response:', { data, error });

      if (error) {
        console.error('Reset password error:', error);
        
        // Handle specific error cases
        if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many password reset requests. Please wait at least 60 seconds before trying again. This helps prevent spam.",
            variant: "destructive",
          });
        } else if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
          toast({
            title: "Email Not Found",
            description: "No account found with this email address. Please check the email or sign up for a new account.",
            variant: "destructive",
          });
        } else if (error.message.includes('signup_disabled')) {
          toast({
            title: "Service Unavailable",
            description: "Password reset is temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        console.log('Password reset email sent successfully');
        setResetEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: `Check your email (${forgotPasswordEmail}) for a password reset link. If you don't see it within 5 minutes, check your spam folder.`,
        });
        
        setForgotPasswordEmail("");
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send password reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Invalid Password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Weak Password",
            description: "Password should be at least 6 characters long and contain a mix of characters.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else if (data.user && !data.session) {
        // User created but needs email verification
        setPendingEmail(email);
        setShowEmailVerification(true);
        toast({
          title: "Account Created",
          description: "Please check your email for a verification code.",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. You can now sign in.",
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Missing Password",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Verified",
            description: "Please verify your email before signing in.",
            variant: "destructive",
          });
          setPendingEmail(email);
          setShowEmailVerification(true);
        } else {
          throw error;
        }
      } else {
        console.log('Sign in successful:', data);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "There was an error signing you in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        throw error;
      } else {
        console.log('Google sign in initiated:', data);
        // The page will redirect to Google, so we don't need to handle success here
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google Sign In Failed",
        description: error.message || "There was an error signing you in with Google. Please try email and password instead.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowEmailVerification(false);
    setPendingEmail("");
    toast({
      title: "Email Verified!",
      description: "You can now sign in with your credentials.",
    });
  };

  const handleBackToSignup = () => {
    setShowEmailVerification(false);
    setPendingEmail("");
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmailVerification
          email={pendingEmail}
          onVerificationComplete={handleVerificationComplete}
          onBackToSignup={handleBackToSignup}
        />
      </div>
    );
  }

  // Password reset form
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isUpdatingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isUpdatingPassword}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isUpdatingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    disabled={isUpdatingPassword}
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    const remainingWaitTime = getRemainingWaitTime();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {resetEmailSent 
                ? "Reset email sent! Check your inbox and spam folder."
                : "Enter your email address and we'll send you a password reset link"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    We've sent a password reset link to your email. The link will expire in 1 hour.
                    If you don't see the email within 5 minutes, please check your spam folder.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> If you still don't receive the email:
                    <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                      <li>Check spam/junk folder thoroughly</li>
                      <li>Wait at least 60 seconds before requesting another reset</li>
                      <li>Make sure the email address is correct</li>
                      <li>Some email providers have delays - be patient</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setResetEmailSent(false);
                      setForgotPasswordEmail("");
                    }}
                    disabled={!canAttemptReset()}
                  >
                    {remainingWaitTime > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Wait {remainingWaitTime}s before retry
                      </>
                    ) : (
                      "Send Another Reset Email"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setForgotPasswordEmail("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!canAttemptReset() && (
                  <Alert>
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      Please wait {remainingWaitTime} seconds before trying again to avoid rate limits.
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      disabled={isResettingPassword}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isResettingPassword || !canAttemptReset()}
                  >
                    {isResettingPassword ? "Sending..." : 
                     !canAttemptReset() ? `Wait ${remainingTime}s...` : 
                     "Send Reset Link"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setForgotPasswordEmail("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </form>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Email Delivery Tips:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside text-xs">
                      <li>Check spam/junk folder if email doesn't arrive</li>
                      <li>Wait 60 seconds between requests to avoid rate limits</li>
                      <li>Some email providers may have delays</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Sign In Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <Separator className="my-4" />
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-sm"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {user && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are logged in. You should be redirected automatically.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-sm"
                  onClick={() => navigate("/")}
                >
                  Go to dashboard
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
