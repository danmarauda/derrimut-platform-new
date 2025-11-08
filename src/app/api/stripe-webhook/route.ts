// ⚠️ DEPRECATED: This webhook handler has been consolidated into Convex
// Stripe webhooks should now be configured to point to:
// https://your-convex-deployment.convex.site/stripe-webhook
//
// The Convex handler at convex/http.ts handles all Stripe webhook events.
// This file is kept for reference but should not be used in production.
//
// To configure Stripe webhooks:
// 1. Go to Stripe Dashboard > Developers > Webhooks
// 2. Add endpoint: https://your-convex-deployment.convex.site/stripe-webhook
// 3. Select events: checkout.session.completed, customer.subscription.*, invoice.payment_*
// 4. Copy the webhook secret to STRIPE_WEBHOOK_SECRET environment variable

export async function POST() {
  return Response.json(
    { 
      error: "This webhook endpoint is deprecated. Please configure Stripe to use the Convex endpoint instead.",
      convexEndpoint: "https://your-convex-deployment.convex.site/stripe-webhook"
    },
    { status: 410 } // 410 Gone - indicates resource is no longer available
  );
}
