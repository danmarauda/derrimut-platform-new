# 🔍 Webhook Verification Guide

## ✅ Webhook Test Triggered Successfully!

The test webhook event was sent. Now verify it was received and processed.

## 📋 How to Check Convex Logs

### Option 1: Watch Logs in Real-Time
```bash
bunx convex logs
```

### Option 2: View Recent Logs
```bash
bunx convex logs --history 50
```

### Option 3: Filter for Webhook Events
```bash
bunx convex logs --history 50 | grep -E "stripe|webhook|checkout"
```

## 🔍 What to Look For

### ✅ Success Indicators:
- `🔥 Stripe webhook received!`
- `✅ Webhook verified successfully`
- `💳 Processing checkout.session.completed`
- `✅ Membership created successfully!`

### ❌ Error Indicators:
- `❌ Missing STRIPE_SECRET_KEY`
- `❌ Webhook signature verification failed`
- `❌ Error:`

## 📊 Expected Log Flow

When a webhook is received, you should see:

1. **Webhook Received:**
   ```
   🔥 Stripe webhook received!
   📝 Request method: POST
   🔗 Request URL: https://...
   ```

2. **Signature Verification:**
   ```
   ✅ Webhook verified successfully
   📩 Event type: checkout.session.completed
   ```

3. **Processing:**
   ```
   💳 Processing checkout.session.completed
   📋 Session ID: cs_test_...
   ```

4. **Success:**
   ```
   ✅ Membership created successfully!
   ```

## 🧪 Test Different Events

You can test different webhook events:

```bash
# Test checkout session completed
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted
```

## 🔧 Troubleshooting

### If webhook not received:
1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret matches
3. Check Convex deployment is running
4. Verify environment variables are set

### If signature verification fails:
1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Verify webhook endpoint URL is correct
3. Check if using correct environment (dev vs prod)

### If membership not created:
1. Check logs for error messages
2. Verify user exists in database
3. Check product IDs match Stripe products
4. Verify subscription data is valid

## 📝 Quick Check Commands

```bash
# Check environment variables
bunx convex env list

# Check recent logs
bunx convex logs --history 20

# Test webhook again
bun run stripe:test-webhooks

# Run full integration test
bun run stripe:test
```

---

**Next Step:** Run `bunx convex logs --history 50` to see if the webhook was received!

