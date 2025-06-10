"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ACTButton, ACTFrameElement } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignUpFormProps extends React.ComponentPropsWithoutRef<"div"> {
  userType?: string;
}

export function SignUpForm({
  className,
  userType,
  ...props
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState("job_seeker");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Set account type based on userType prop
  useEffect(() => {
    if (userType) {
      if (userType === "professional" || userType === "job_seeker") {
        setAccountType("job_seeker");
      } else if (userType === "partner" || userType === "organization") {
        setAccountType("partner");
      }
    }
  }, [userType]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    try {
      // Create user account with metadata
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName,
            account_type: accountType,
          }
        },
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Create profile based on account type using simplified table structure
        if (accountType === "job_seeker") {
          const { error: profileError } = await supabase
            .from('job_seeker_profiles')
            .insert({
              id: user.id,
              email: email,
              full_name: fullName,
              profile_completed: false,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here - user is created successfully, profile can be created later
          }
        } else if (accountType === "partner") {
          const { error: partnerError } = await supabase
            .from('partner_profiles')
            .insert({
              id: user.id,
              email: email,
              full_name: fullName,
              organization_name: fullName, // Default to full name, can be updated later
              organization_type: 'employer', // Default type
              profile_completed: false,
            });

          if (partnerError) {
            console.error('Partner profile creation error:', partnerError);
            // Don't throw here - user is created successfully, profile can be created later
          }
        }
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      console.error('Sign-up error:', error);
      setError(error instanceof Error ? error.message : "An error occurred during sign-up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 max-w-md mx-auto p-6", className)} {...props}>
      <ACTFrameElement variant="full" size="lg" className="bg-base-100">
        <div className="text-center mb-8">
          {/* ACT Branding */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 border-3 border-spring-green rounded-lg flex items-center justify-center bg-spring-green/10">
              <span className="text-spring-green font-helvetica font-bold text-xl">A</span>
            </div>
            <div className="text-left">
              <h1 className="font-helvetica font-medium text-lg text-midnight-forest leading-tight">
                Alliance for Climate Transition
              </h1>
              <p className="font-inter text-sm text-moss-green leading-tight">
                Climate Economy Assistant
              </p>
            </div>
          </div>
          
          <h2 className="text-title font-helvetica font-medium text-midnight-forest mb-3">
            Join the Climate Economy
          </h2>
          <p className="text-body font-inter text-midnight-forest/70">
            Create your account and accelerate your climate career journey
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-inter font-medium text-midnight-forest">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-moss-green/30 focus:border-spring-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="font-inter font-medium text-midnight-forest">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-moss-green/30 focus:border-spring-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountType" className="font-inter font-medium text-midnight-forest">
              I am a...
            </Label>
            <Select
              value={accountType}
              onValueChange={(value) => setAccountType(value)}
            >
              <SelectTrigger className="border-moss-green/30 focus:border-spring-green">
                <SelectValue placeholder="Select your account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_seeker">
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-midnight-forest">Climate Professional</span>
                    <span className="text-sm text-moss-green">
                      Looking for climate career opportunities
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="partner">
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-midnight-forest">Climate Organization</span>
                    <span className="text-sm text-moss-green">
                      Hiring climate professionals
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-inter font-medium text-midnight-forest">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-moss-green/30 focus:border-spring-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="font-inter font-medium text-midnight-forest">
              Confirm Password
            </Label>
            <Input
              id="repeat-password"
              type="password"
              placeholder="Confirm your password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="border-moss-green/30 focus:border-spring-green"
            />
          </div>
          
          {error && (
            <ACTFrameElement variant="open" size="sm" className="border-red-400 bg-red-50/50">
              <p className="text-sm text-red-600 font-inter">
                {error}
              </p>
            </ACTFrameElement>
          )}
          
          <ACTButton 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? "Creating your account..." : "Join the Climate Economy"}
          </ACTButton>
          
          <div className="text-center text-sm">
            <span className="text-midnight-forest/60 font-inter">
              Already have an account?{" "}
            </span>
            <Link
              href="/auth/login"
              className="font-medium text-spring-green hover:text-moss-green transition-colors font-inter"
            >
              Sign in
            </Link>
          </div>
          
          <div className="text-xs text-midnight-forest/50 text-center font-inter">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-spring-green">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-spring-green">
              Privacy Policy
            </Link>
            .
          </div>
        </form>
      </ACTFrameElement>
    </div>
  );
}
