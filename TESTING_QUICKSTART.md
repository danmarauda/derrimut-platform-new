# 🧪 Payment Flow Testing - Quick Start

## 🚀 Quick Start Commands

### 1. Start Development Server
```bash
bun run dev
```

### 2. Verify Setup
```bash
# Check Convex environment variables
bunx convex env list

# Test webhook endpoint
bun run stripe:test-webhooks customer.subscription.created

# View Convex logs
bunx convex logs --history 10
```

## 🧪 Test Flows

### Flow 1: Membership Subscription
1. Navigate to: http://localhost:3000/membership
2. Select a plan (Core or Premium)
3. Use test card: `4242 4242 4242 4242`
4. Verify membership created in Convex

### Flow 2: Marketplace Checkout
1. Navigate to: http://localhost:3000/marketplace
2. Add products to cart
3. Checkout with test card: `4242 4242 4242 4242`
4. Verify order created in Convex

### Flow 3: Trainer Booking
1. Navigate to: http://localhost:3000/trainer
2. Select trainer and book session
3. Pay with test card: `4242 4242 4242 4242`
4. Verify booking created in Convex

## 📊 Test Results

Track your test results as you go through each flow.

### Flow 1: Membership Subscription
- [ ] Checkout completes
- [ ] Membership created in Convex
- [ ] Webhook received

### Flow 2: Marketplace Checkout
- [ ] Cart works
- [ ] Payment processes
- [ ] Order created in Convex

### Flow 3: Trainer Booking
- [ ] Booking flow works
- [ ] Payment processes
- [ ] Booking created in Convex

## 🔧 Troubleshooting

If something fails:
1. Check Convex logs: `bunx convex logs --history 20`
2. Check browser console for errors
3. Verify Stripe test mode is enabled
4. Check webhook events in Stripe Dashboard

---

**Ready to test!** Start with Flow 1: Membership Subscription 🚀

