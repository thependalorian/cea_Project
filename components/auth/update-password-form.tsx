/**
 * Update Password Form Component
 * Allows users to set a new password after password reset
 * Location: components/auth/update-password-form.tsx
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UpdatePasswordFormProps extends React.ComponentPropsWithoutRef<"div"> {}

export function UpdatePasswordForm({
  className,
  ...props
}: UpdatePasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid session using secure API
    const checkSession = async () => {
      try {
        const response = await fetch('/api/v1/auth/check-session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const { valid } = await response.json();
          setIsValidSession(valid);
        } else {
          // If no valid session, redirect to forgot password
          router.push('/auth/forgot-password');
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/auth/forgot-password');
      }
    };

    checkSession();
  }, [router]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(pwd)) {
      return "Password must contain at least one special character (@$!%*?&)";
    }
    return null;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Use secure API endpoint for password update
      const response = await fetch('/api/v1/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully');
      }, 3000);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <CardTitle className="text-2xl">Loading...</CardTitle>
          <CardDescription>Verifying your session</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl">Password Updated!</CardTitle>
          </div>
          <CardDescription>
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You will be redirected to the login page shortly.
          </p>
          <Button 
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Please enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* New Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Password must contain:</p>
                <ul className="space-y-1 ml-4">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    • At least 8 characters
                  </li>
                  <li className={/(?=.*[a-z])/.test(password) ? "text-green-600" : ""}>
                    • One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>
                    • One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}>
                    • One number
                  </li>
                  <li className={/(?=.*[@$!%*?&])/.test(password) ? "text-green-600" : ""}>
                    • One special character (@$!%*?&)
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 