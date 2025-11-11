"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SignUpPage = () => {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Get referral code from URL
    const ref = searchParams?.get("ref");
    if (ref) {
      setReferralCode(ref);
      // Store in localStorage for after signup
      localStorage.setItem("referralCode", ref);
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-neutral-950 relative overflow-hidden">
      {/* Background Effects - Matching homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
      
      {/* Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-md mx-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm border-gradient before:rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
              Join Derrimut 24:7
            </h1>
            <p className="text-white/60 text-sm">
              Start your fitness journey today
            </p>
            {referralCode && (
              <div className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded-lg">
                <p className="text-sm text-white/90">
                  🎉 You were referred! Use code: <strong>{referralCode}</strong>
                </p>
              </div>
            )}
          </div>
          
          <SignUp 
            appearance={clerkAppearance}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;