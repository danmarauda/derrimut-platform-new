import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/generate-program", 
  "/profile", 
  "/admin(.*)", 
  "/trainer(.*)", 
  "/become-trainer"
]);

/**
 * Next.js 16 Proxy Handler
 * Replaces middleware.ts with proxy.ts for better performance and Next.js 16 compatibility
 * 
 * Note: Clerk's clerkMiddleware still works with Next.js 16, but using proxy.ts
 * follows the new convention and provides better type safety.
 */
export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

