"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { clerkAppearance } from "@/lib/clerk-appearance";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8187" : undefined);

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
}

const convex = new ConvexReactClient(convexUrl);

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <ConvexProviderWithClerk 
        client={convex} 
        useAuth={useAuth}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;