import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/generate-program", 
  "/profile", 
  "/admin(.*)", 
  "/trainer(.*)", 
  "/become-trainer"
]);

/**
 * Next.js 16 Proxy Handler (Edge Runtime Optimized)
 * 
 * Optimized for Vercel Edge Network:
 * - Runs on Edge Runtime for lowest latency
 * - Minimal dependencies
 * - Fast route matching
 * - Proper caching headers
 * 
 * Best Practices:
 * - Use edge runtime for authentication middleware
 * - Cache static route checks
 * - Minimize external API calls
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
    // Note: manifest.json is handled by Next.js automatically, so we exclude it
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
  // Clerk middleware automatically runs on Edge Runtime for optimal performance
};

