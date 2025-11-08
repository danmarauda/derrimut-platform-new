# Apple OAuth Setup Guide - Derrimut Platform

**Date:** 2025-01-09
**Platform:** Derrimut 24:7 Gym
**Domain:** derrimut.aliaslabs.ai

---

## 📋 Overview

This guide walks through configuring Apple OAuth for the Derrimut Platform using Clerk authentication. Apple Sign-In allows users to authenticate using their Apple ID with strong privacy protections.

### Current Clerk Configuration

**Clerk Instance:** `busy-cow-62.clerk.accounts.dev`
**Production Domain:** `clerk.derrimut.aliaslabs.ai`
**Return URL:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`
**Email Relay:** `bounces+57194508@clkmail.derrimut.aliaslabs.ai`

---

## 🎯 Prerequisites

Before starting, ensure you have:

1. ✅ **Apple Developer Account** ($99/year)
   - Enrolled in Apple Developer Program
   - Access to [developer.apple.com](https://developer.apple.com)

2. ✅ **Clerk Account**
   - Production instance created
   - Custom domain configured (`clerk.derrimut.aliaslabs.ai`)

3. ✅ **Domain Access**
   - DNS control for `derrimut.aliaslabs.ai`
   - Ability to verify domain ownership

4. ✅ **Admin Access**
   - Clerk dashboard admin access
   - Apple Developer admin access

---

## 🔧 Step-by-Step Setup

### Step 1: Register App ID in Apple Developer Console

1. **Navigate to Apple Developer**
   - Go to [developer.apple.com/account](https://developer.apple.com/account)
   - Sign in with your Apple Developer account

2. **Create App ID**
   ```
   Navigate: Certificates, Identifiers & Profiles > Identifiers > App IDs
   Click: [+] button to create new App ID
   ```

3. **Configure App ID**
   ```
   Type: App IDs
   Select: App

   Description: Derrimut 24:7 Gym Platform
   Bundle ID: ai.aliaslabs.derrimut (or your preferred reverse domain)

   Capabilities:
   ✅ Sign In with Apple
   ```

4. **Save App ID**
   - Click "Continue"
   - Review and click "Register"
   - **Copy the App ID** (e.g., `ai.aliaslabs.derrimut`)

---

### Step 2: Create Service ID for Web Authentication

1. **Create Service ID**
   ```
   Navigate: Certificates, Identifiers & Profiles > Identifiers > Services IDs
   Click: [+] button
   ```

2. **Configure Service ID**
   ```
   Description: Derrimut Platform Web OAuth
   Identifier: ai.aliaslabs.derrimut.web

   ✅ Enable: Sign In with Apple
   Click: Configure button next to "Sign In with Apple"
   ```

3. **Configure Sign In with Apple**
   ```
   Primary App ID: ai.aliaslabs.derrimut (from Step 1)

   Domains and Subdomains:
   - derrimut.aliaslabs.ai
   - clerk.derrimut.aliaslabs.ai

   Return URLs:
   - https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
   ```

4. **Save Configuration**
   - Click "Save"
   - Click "Continue"
   - Click "Register"
   - **Copy the Service ID** (e.g., `ai.aliaslabs.derrimut.web`)

---

### Step 3: Generate Private Key

1. **Create New Key**
   ```
   Navigate: Certificates, Identifiers & Profiles > Keys
   Click: [+] button to create new key
   ```

2. **Configure Key**
   ```
   Key Name: Derrimut OAuth Private Key

   ✅ Enable: Sign In with Apple
   Click: Configure button
   ```

3. **Associate with App ID**
   ```
   Primary App ID: ai.aliaslabs.derrimut (from Step 1)
   Click: Save
   Click: Continue
   Click: Register
   ```

4. **Download Private Key**
   ```
   ⚠️ IMPORTANT: You can only download this ONCE!

   Click: Download
   File downloaded: AuthKey_XXXXXXXXXX.p8

   Save this file securely - you'll need it for Clerk configuration
   ```

5. **Note the Key ID**
   - **Copy the Key ID** (10 characters, e.g., `ABC123DEFG`)
   - This is shown on the key details page

---

### Step 4: Get Team ID

1. **Find Team ID**
   ```
   Navigate: Apple Developer Account > Membership
   Look for: Team ID (10 characters)

   Example: XYZ987WXYZ
   ```

2. **Copy Team ID**
   - This is required for Clerk configuration

---

### Step 5: Configure Clerk with Apple Credentials

1. **Open Clerk Dashboard**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your production instance

2. **Navigate to Social Connections**
   ```
   Dashboard > User & Authentication > Social Connections
   Find: Apple
   Click: Configure or gear icon
   ```

3. **Enable Apple OAuth**
   ```
   ✅ Enable for sign-up and sign-in
   ✅ Use custom credentials
   ```

4. **Enter Apple Credentials**

   **Apple Services ID:**
   ```
   ai.aliaslabs.derrimut.web
   ```
   _(The Service ID from Step 2)_

   **Apple Private Key:**
   ```
   -----BEGIN PRIVATE KEY-----
   [Paste entire contents of AuthKey_XXXXXXXXXX.p8 file here]
   -----END PRIVATE KEY-----
   ```
   ⚠️ **Important:** Include the BEGIN and END lines!

   **Apple Team ID:**
   ```
   XYZ987WXYZ
   ```
   _(Your 10-character Team ID from Step 4)_

   **Apple Key ID:**
   ```
   ABC123DEFG
   ```
   _(The 10-character Key ID from Step 3)_

   **Email Source for Apple Private Email Relay:**
   ```
   bounces+57194508@clkmail.derrimut.aliaslabs.ai
   ```
   _(Pre-filled by Clerk, do not change)_

   **Return URL:**
   ```
   https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
   ```
   _(Pre-filled by Clerk, verify it's correct)_

5. **Optional Settings**
   ```
   ✅ Always show account selector prompt
   (Allows users to select account when authenticating)
   ```

6. **Save Configuration**
   - Click "Apply Changes" or "Save"

---

### Step 6: Verify Domain in Apple Developer Console

1. **Return to Apple Developer**
   ```
   Navigate: Certificates, Identifiers & Profiles > Services IDs
   Select: ai.aliaslabs.derrimut.web
   Click: Configure (for Sign In with Apple)
   ```

2. **Verify Domains**
   - Apple may require domain verification
   - Download verification file if prompted
   - Upload to your web server root: `https://derrimut.aliaslabs.ai/.well-known/apple-developer-domain-association.txt`

3. **Complete Verification**
   - Click "Verify" in Apple Developer Console
   - Ensure all domains show as verified

---

## 🧪 Testing Apple OAuth

### Test in Development

1. **Update Environment Variables**

   Add to `.env.local`:
   ```bash
   # Clerk Configuration (already present)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnVzeS1jb3ctNjIuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_78PTOTYIbA9LTDstbvsKvgEu3H3nQcoFbNGMs9erOP

   # Apple OAuth is configured in Clerk dashboard, no additional env vars needed
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Sign In Flow**
   - Navigate to http://localhost:3000/sign-in
   - Look for "Continue with Apple" button
   - Click and authenticate with Apple ID
   - Verify redirect back to application
   - Check user profile created in Clerk dashboard

### Test in Production

1. **Deploy to Production**
   ```bash
   git add .
   git commit -m "feat: Add Apple OAuth configuration"
   git push origin main
   ```

2. **Verify Production URLs**
   - Sign In page: https://derrimut.aliaslabs.ai/sign-in
   - Clerk OAuth callback: https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback

3. **Test Complete Flow**
   - Use real Apple ID (not test account)
   - Test on multiple devices (iOS, macOS, Windows, Android)
   - Verify email relay works correctly

---

## 🔐 Security Best Practices

### Private Key Security

1. **Never Commit Private Key to Git**
   ```bash
   # Add to .gitignore if storing locally:
   AuthKey_*.p8
   apple-oauth-credentials/
   ```

2. **Store Securely**
   - Use password manager for private key
   - Limit access to authorized personnel only
   - Consider using secret management (AWS Secrets Manager, 1Password, etc.)

3. **Rotate Keys Annually**
   - Apple keys don't expire, but rotate for security
   - Generate new key, update Clerk, delete old key

### Domain Security

1. **Use HTTPS Only**
   - All return URLs must use HTTPS
   - Enforce SSL/TLS on all domains

2. **Verify Return URLs**
   - Only add trusted domains to Apple configuration
   - Never add localhost or development URLs in production config

### User Privacy

1. **Apple Private Email Relay**
   - Users can choose to hide their real email
   - Apple generates relay email: `xyz123@privaterelay.appleid.com`
   - Relay forwards to user's real email
   - Handle relay emails properly in your system

2. **Email Bounce Handling**
   - Configure email relay bounce address: `bounces+57194508@clkmail.derrimut.aliaslabs.ai`
   - Monitor bounces for delivery issues
   - Apple may disable relay if too many bounces

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid client" Error

**Problem:** Service ID not recognized

**Solutions:**
- Verify Service ID matches exactly in Clerk and Apple Developer
- Check Service ID is registered in Apple Developer Console
- Ensure "Sign In with Apple" is enabled for Service ID

#### 2. "Invalid redirect_uri" Error

**Problem:** Return URL mismatch

**Solutions:**
- Verify return URL in Apple Developer Console: `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`
- Check domain is verified in Apple Developer Console
- Ensure HTTPS is used (not HTTP)
- Clear browser cache and try again

#### 3. "Invalid private key" Error

**Problem:** Private key format incorrect

**Solutions:**
- Include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- No extra spaces or line breaks
- Copy entire file contents including newlines
- Verify `.p8` file is not corrupted

#### 4. "Domain verification failed" Error

**Problem:** Apple cannot verify domain ownership

**Solutions:**
- Upload verification file to `https://derrimut.aliaslabs.ai/.well-known/apple-developer-domain-association.txt`
- Ensure file is publicly accessible (no authentication required)
- Check file content matches Apple's requirement
- Verify domain SSL certificate is valid

#### 5. Apple Sign In Button Not Showing

**Problem:** Apple OAuth not enabled in Clerk

**Solutions:**
- Check Clerk dashboard: Social Connections > Apple > Enabled
- Verify "Enable for sign-up and sign-in" is checked
- Clear Clerk cache: `npx convex dev --once`
- Check browser console for JavaScript errors

#### 6. "Email already exists" Error

**Problem:** User tries to sign in with Apple but email already used with different provider

**Solutions:**
- Enable account linking in Clerk settings
- Ask user to sign in with original provider first
- Manually merge accounts in Clerk dashboard
- Configure email address verification

---

## 📊 Monitoring & Analytics

### Track Apple Sign-Ins

1. **Clerk Dashboard Analytics**
   ```
   Dashboard > Analytics > Authentication
   Filter by: Apple OAuth
   Metrics: Sign-ups, Sign-ins, Active users
   ```

2. **Custom Analytics (Convex)**
   ```typescript
   // Track OAuth provider in users table
   // convex/users.ts
   export const createUser = mutation({
     handler: async (ctx, args) => {
       await ctx.db.insert("users", {
         ...args,
         oauthProvider: "apple", // Track which OAuth provider was used
         createdAt: Date.now(),
       });
     },
   });
   ```

3. **Monitor Email Relay**
   - Check `bounces+57194508@clkmail.derrimut.aliaslabs.ai` for bounce notifications
   - Track relay email usage vs. real email usage
   - Monitor Apple's relay email rate limits

### Key Metrics to Track

- **Sign-up conversion rate** - % of users choosing Apple vs. other methods
- **Email relay usage** - % of users using private email relay
- **Bounce rate** - Email delivery failures
- **Sign-in frequency** - Apple OAuth vs. email/password
- **Device distribution** - iOS vs. macOS vs. web

---

## 🔄 Maintenance

### Regular Tasks

**Monthly:**
- Review authentication logs for errors
- Check email bounce rate
- Monitor OAuth success/failure rates

**Quarterly:**
- Review Apple Developer account status
- Check for Apple policy updates
- Audit return URLs and domains

**Annually:**
- Rotate Apple private keys
- Review security practices
- Update documentation

### Apple Developer Account

1. **Renew Annual Membership**
   - Cost: $99/year
   - Renew before expiration to avoid service interruption
   - Update payment method if needed

2. **Monitor Apple Announcements**
   - Sign In with Apple updates
   - Privacy policy changes
   - New requirements or deprecations

---

## 📚 Additional Resources

### Official Documentation

- **Apple Sign In with Apple:** https://developer.apple.com/sign-in-with-apple/
- **Clerk Apple OAuth Guide:** https://clerk.com/docs/authentication/social-connections/apple
- **Apple Developer Portal:** https://developer.apple.com/account

### Support

- **Clerk Support:** support@clerk.com
- **Apple Developer Support:** https://developer.apple.com/contact/
- **Derrimut Platform Issues:** [Your support email]

---

## ✅ Post-Setup Checklist

After completing setup, verify:

- [ ] Apple Service ID created and configured
- [ ] Private key generated and saved securely
- [ ] Team ID and Key ID documented
- [ ] Clerk dashboard configured with all credentials
- [ ] Domain verified in Apple Developer Console
- [ ] Return URLs match exactly
- [ ] Email relay bounce address configured
- [ ] Development environment tested
- [ ] Production environment tested
- [ ] iOS/macOS/web browsers tested
- [ ] Error handling tested
- [ ] Analytics tracking enabled
- [ ] Documentation updated
- [ ] Team members trained on Apple OAuth flow

---

## 🚨 Emergency Procedures

### If Apple OAuth Stops Working

1. **Check Apple Developer Account Status**
   - Ensure membership is active
   - Verify no suspended services

2. **Verify Credentials in Clerk**
   - Service ID correct
   - Private key not expired
   - Team ID and Key ID match

3. **Check Domain Status**
   - SSL certificate valid
   - Domain verification still active
   - DNS records pointing correctly

4. **Fallback Plan**
   - Users can still use email/password sign-in
   - Other OAuth providers (Google, etc.) still functional
   - Communicate status to users via email/banner

### Contact Information

**Apple Developer Support:**
- Phone: 1-800-633-2152 (US)
- Web: https://developer.apple.com/contact/

**Clerk Support:**
- Email: support@clerk.com
- Dashboard: Help widget in bottom-right

---

*Last Updated: January 9, 2025*
*Next Review: April 9, 2025*
