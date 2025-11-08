# 🧪 Payment Flow Testing Guide

## 🎯 Objective
Test all three payment flows end-to-end to ensure Stripe integration works correctly with Derrimut 24:7 Gym platform.

---

## 📋 Pre-Testing Checklist

### ✅ Prerequisites
- [ ] Development server running (`bun run dev`)
- [ ] Convex deployment active
- [ ] Stripe test mode enabled
- [ ] Environment variables configured
- [ ] Webhook endpoint configured

### ✅ Verify Setup
```bash
# Check Convex environment variables
bunx convex env list

# Test webhook endpoint
bun run stripe:test-webhooks customer.subscription.created

# Check Convex logs
bunx convex logs --history 10
```

---

## 🧪 Test Flow 1: Membership Subscription

### Test Steps
1. **Navigate to Membership Page**
   - URL: `http://localhost:3000/membership`
   - Verify all 4 Derrimut plans are displayed
   - Check currency shows AUD ($)

2. **Select a Membership Plan**
   - Choose: **Core (12 Month Minimum)** or **Premium (12 Month Minimum)**
   - Click "Join Now" or "Subscribe"

3. **Complete Stripe Checkout**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Test User
   - Email: test@example.com

4. **Verify Success**
   - Should redirect to `/membership/success`
   - Check Convex dashboard for membership record
   - Verify membership type matches selected plan
   - Verify subscription status is "active"

### Expected Webhook Events
- `checkout.session.completed` (mode: subscription)
- `customer.subscription.created`
- `invoice.payment_succeeded`

### Verification Commands
```bash
# Check Convex logs for membership creation
bunx convex logs --history 20 | grep -i membership

# View memberships in database
# Go to: https://dashboard.convex.dev
# Navigate to: Data → memberships table
```

### ✅ Success Criteria
- [ ] Checkout completes without errors
- [ ] Membership record created in Convex
- [ ] Correct membership type assigned
- [ ] Subscription status is "active"
- [ ] Webhook events received and processed

---

## 🧪 Test Flow 2: Marketplace Checkout

### Test Steps
1. **Navigate to Marketplace**
   - URL: `http://localhost:3000/marketplace`
   - Browse available products

2. **Add Products to Cart**
   - Add 2-3 products
   - Verify cart shows correct items
   - Check currency displays AUD ($)

3. **Proceed to Checkout**
   - Click "View Cart" or cart icon
   - Review order summary
   - Verify shipping calculation (free over $200 AUD)
   - Verify tax calculation (10% GST)

4. **Complete Payment**
   - Use test card: `4242 4242 4242 4242`
   - Fill shipping address (Australian address)
   - Complete payment

5. **Verify Success**
   - Check order created in Convex
   - Verify order status is "confirmed"
   - Verify payment status is "paid"
   - Check order items match cart

### Expected Webhook Events
- `checkout.session.completed` (mode: payment)
- Metadata: `type: "marketplace_order"`

### Verification Commands
```bash
# Check Convex logs for order creation
bunx convex logs --history 20 | grep -i order

# View orders in database
# Go to: https://dashboard.convex.dev
# Navigate to: Data → orders table
```

### ✅ Success Criteria
- [ ] Cart functionality works
- [ ] Shipping calculated correctly
- [ ] Tax calculated correctly (10% GST)
- [ ] Payment processes successfully
- [ ] Order created in Convex
- [ ] Order items match cart contents

---

## 🧪 Test Flow 3: Trainer Booking Payment

### Test Steps
1. **Navigate to Trainer Page**
   - URL: `http://localhost:3000/trainer`
   - Browse available trainers
   - Select a trainer

2. **Book a Session**
   - URL: `http://localhost:3000/book-session/[trainerId]`
   - Select date and time
   - Review session details
   - Verify price displays in AUD ($)

3. **Complete Payment**
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

4. **Verify Success**
   - Check booking created in Convex
   - Verify booking status is "confirmed"
   - Verify payment status is "paid"
   - Check trainer availability updated

### Expected Webhook Events
- `checkout.session.completed` (mode: payment)
- Metadata: `type: "booking"`

### Verification Commands
```bash
# Check Convex logs for booking creation
bunx convex logs --history 20 | grep -i booking

# View bookings in database
# Go to: https://dashboard.convex.dev
# Navigate to: Data → bookings table
```

### ✅ Success Criteria
- [ ] Trainer selection works
- [ ] Date/time selection works
- [ ] Payment processes successfully
- [ ] Booking created in Convex
- [ ] Trainer availability updated

---

## 🧪 Test Flow 4: Subscription Updates

### Test Steps
1. **Trigger Subscription Update**
   - Use Stripe CLI to simulate update:
   ```bash
   bun run stripe:test-webhooks customer.subscription.updated
   ```

2. **Verify Update Processing**
   - Check Convex logs for update event
   - Verify membership record updated
   - Check subscription status changes

### ✅ Success Criteria
- [ ] Webhook event received
- [ ] Membership record updated
- [ ] Status changes reflected correctly

---

## 🧪 Test Flow 5: Payment Failures

### Test Steps
1. **Test Declined Card**
   - Use test card: `4000 0000 0000 0002`
   - Attempt membership purchase
   - Verify error handling

2. **Test 3D Secure**
   - Use test card: `4000 0025 0000 3155`
   - Complete 3D Secure flow
   - Verify payment succeeds

### ✅ Success Criteria
- [ ] Declined cards handled gracefully
- [ ] Error messages displayed to user
- [ ] 3D Secure flow works correctly

---

## 📊 Test Results Template

### Test Run: [Date]

#### Flow 1: Membership Subscription
- Status: ⬜ Pass / ⬜ Fail
- Notes: 
- Issues:

#### Flow 2: Marketplace Checkout
- Status: ⬜ Pass / ⬜ Fail
- Notes:
- Issues:

#### Flow 3: Trainer Booking
- Status: ⬜ Pass / ⬜ Fail
- Notes:
- Issues:

#### Flow 4: Subscription Updates
- Status: ⬜ Pass / ⬜ Fail
- Notes:
- Issues:

#### Flow 5: Payment Failures
- Status: ⬜ Pass / ⬜ Fail
- Notes:
- Issues:

---

## 🔧 Troubleshooting

### Issue: Webhook Not Received
**Solution:**
1. Verify webhook URL in Stripe dashboard
2. Check webhook secret matches `.env.local`
3. Ensure Convex deployment is active
4. Check Convex logs: `bunx convex logs`

### Issue: Payment Not Processing
**Solution:**
1. Verify Stripe keys in `.env.local`
2. Check product IDs in `convex/memberships.ts`
3. Ensure test mode is enabled
4. Check browser console for errors

### Issue: Membership Not Created
**Solution:**
1. Check webhook events in Stripe dashboard
2. Verify webhook handler in `convex/http.ts`
3. Check Convex logs for errors
4. Verify membership type mapping

### Issue: Currency Display Wrong
**Solution:**
1. Check `formatCurrency` functions
2. Verify currency constants in `branding.ts`
3. Check API routes for currency settings

---

## 📝 Stripe Test Cards

### Success Cards
- `4242 4242 4242 4242` - Standard success
- `5555 5555 5555 4444` - Mastercard success

### Decline Cards
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

### 3D Secure Cards
- `4000 0025 0000 3155` - Requires authentication
- `4000 0027 6000 3184` - Authentication required

### Other Test Cards
- `4000 0000 0000 3220` - Requires authentication (3D Secure)
- `4000 0000 0000 3055` - Requires authentication

---

## 🎯 Quick Test Commands

```bash
# Test webhook delivery
bun run stripe:test-webhooks customer.subscription.created

# View Convex logs
bunx convex logs --history 20

# Check environment variables
bunx convex env list

# Start dev server
bun run dev

# Test Stripe integration
bun run stripe:test
```

---

## ✅ Final Checklist

- [ ] All 3 payment flows tested
- [ ] Webhook events received and processed
- [ ] Database records created correctly
- [ ] Currency displays correctly (AUD)
- [ ] Error handling works
- [ ] Success pages display correctly
- [ ] Email confirmations (if configured)
- [ ] Admin dashboard shows transactions

---

**Status:** Ready for testing! 🚀

