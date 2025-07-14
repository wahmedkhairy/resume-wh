
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { AlertCircle, Eye, EyeOff, CheckCircle, Clock, Key, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmailVerification from "@/components/EmailVerification";

const ADMIN_EMAIL = 'ahmedz.khairy88@gmail.com';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const [showPasswordResetOptions, setShowPasswordResetOptions] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [lastResetAttempt, setLastResetAttempt] = useState<number | null>(null);
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
          setShowPasswordResetOptions(true);
          toast({
            title: "Password Reset Link Verified",
            description: "Choose how you'd like to proceed.",
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
        if (event === 'SIGNED_IN' && session?.user && !isPasswordReset && !showPasswordResetOptions) {
          // Check if the signed in user is the admin
          if (session.user.email === ADMIN_EMAIL) {
            toast({
              title: "Welcome Admin!",
              description: "You have successfully signed in as administrator.",
            });
            
            // Check if there's a redirect parameter
            const redirect = searchParams.get('redirect');
            console.log('Redirect parameter:', redirect);
            
            if (redirect === 'admin') {
              console.log('Redirecting to admin panel');
              navigate("/admin");
            } else {
              console.log('Redirecting to admin panel (default for admin user)');
              navigate("/admin");
            }
          } else {
            // Sign out non-admin users immediately
            supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "Only authorized administrators can access this system.",
              variant: "destructive",
            });
          }
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
          setShowPasswordResetOptions(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialLoading(false);
      
      if (session?.user && !isPasswordReset && !showPasswordResetOptions) {
        // Check if the existing user is the admin
        if (session.user.email === ADMIN_EMAIL) {
          // Check if there's a redirect parameter
          const redirect = searchParams.get('redirect');
          console.log('Initial redirect check:', redirect);
          
          if (redirect === 'admin') {
            console.log('Initial redirect to admin panel');
            navigate("/admin");
          } else {
            console.log('Initial redirect to admin panel (default for admin user)');
            navigate("/admin");
          }
        } else {
          // Sign out non-admin users
          supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, searchParams, isPasswordReset, showPasswordResetOptions]);

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

  const handleGoToHomePage = () => {
    navigate("/");
  };

  const handleChooseNewPassword = () => {
    setShowPasswordResetOptions(false);
    setIsPasswordReset(true);
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
        description: "Your password has been successfully updated. Redirecting to admin panel...",
      });
      
      // Clear the reset state and redirect
      setIsPasswordReset(false);
      setShowPasswordResetOptions(false);
      setNewPassword("");
      setConfirmNewPassword("");
      
      // Clear URL parameters and redirect to admin
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 1500);
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
    
    // Only allow password reset for admin email
    if (forgotPasswordEmail !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "Password reset is only available for authorized administrators.",
        variant: "destructive",
      });
      return;
    }

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
            description: "No account found with this email address. Please check the email or contact support.",
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
          description: "Check your email for a password reset link. It should arrive within 2-5 seconds.",
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
    
    // Prevent sign up - only admin can access
    toast({
      title: "Registration Not Available",
      description: "This is an administrator-only system. Sign up is not available.",
      variant: "destructive",
    });
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
    console.log('Attempting sign in for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
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
        // Additional check for admin email after successful authentication
        if (data.user && data.user.email !== ADMIN_EMAIL) {
          console.log('Non-admin user signed in, signing out:', data.user.email);
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Only authorized administrators can access this system.",
            variant: "destructive",
          });
        }
        // Toast will be shown in the auth state change handler for admin users
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
    // Disable Google sign in for admin-only system
    toast({
      title: "Google Sign In Not Available",
      description: "This is an administrator-only system. Please use email and password to sign in.",
      variant: "destructive",
    });
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

  // Password reset options screen
  if (showPasswordResetOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Password Reset</CardTitle>
            <CardDescription className="text-center">
              Choose how you'd like to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleChooseNewPassword}
                className="w-full h-12 flex items-center justify-center gap-3"
                size="lg"
              >
                <Key className="h-5 w-5" />
                Create New Password
              </Button>
              
              <Button 
                onClick={() => navigate("/admin")}
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3"
                size="lg"
              >
                <Home className="h-5 w-5" />
                Go to Admin Panel
              </Button>
            </div>
            
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                You can change your password later in your account settings
              </p>
            </div>
          </CardContent>
        </Card>
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
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsPasswordReset(false);
                  setShowPasswordResetOptions(true);
                }}
                disabled={isUpdatingPassword}
              >
                Back to Options
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
                ? "Reset email sent! Check your inbox."
                : "Enter the administrator email address to reset password"
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
                    The email should arrive within 2-5 seconds.
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
                    <Label htmlFor="forgot-email">Administrator Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter administrator email"
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
                     !canAttemptReset() ? `Wait ${remainingWaitTime}s...` : 
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
          <CardTitle className="text-2xl text-center">Administrator Access</CardTitle>
          <CardDescription className="text-center">
            Sign in with administrator credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="signin">Admin Sign In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Administrator Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter administrator email"
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
                      placeholder="Enter administrator password"
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
                  {isLoading ? "Signing In..." : "Sign In as Administrator"}
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
          </Tabs>

          {user && user.email === ADMIN_EMAIL && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are logged in as administrator. You should be redirected automatically.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-sm"
                  onClick={() => navigate("/admin")}
                >
                  Go to admin panel
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
