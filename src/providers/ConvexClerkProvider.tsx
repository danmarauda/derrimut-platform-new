"use client";

import { ClerkProvider, useAuth, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

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
      // Enable Organizations for location/franchise management
      organization={{
        // Allow users to create organizations (locations/franchises)
        allowOrganizationCreation: true,
        // Maximum number of organizations a user can create
        maxAllowedMemberships: 1, // Users can only be admin of one location
      }}
    >
      <ConvexProviderWithClerk 
        client={convex} 
        useAuth={useAuth}
        useOrganization={useOrganization}
        useOrganizationList={useOrganizationList}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
