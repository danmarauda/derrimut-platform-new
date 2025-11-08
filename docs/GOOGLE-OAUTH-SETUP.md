# Google OAuth Setup Guide - Derrimut Platform

**Date:** January 9, 2025  
**Platform:** Derrimut 24:7 Gym  
**Domain:** derrimut.aliaslabs.ai

---

## 📋 Overview

This guide documents the Google OAuth configuration for the Derrimut Platform using Clerk authentication. Google Sign-In allows users to authenticate using their Google account.

### Current Clerk Configuration

**Clerk Instance:** `busy-cow-62.clerk.accounts.dev`  
**Production Domain:** `clerk.derrimut.aliaslabs.ai`  
**Authorized Redirect URI:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`  
**OAuth Callback:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`

---

## 🔧 Google OAuth Configuration

### Clerk Dashboard Settings

**Status:** ✅ Configured and Enabled

#### Connection Settings
- ✅ **Enable for sign-up and sign-in:** ON
- ✅ **Block email subaddresses:** ON
- ✅ **Use custom credentials:** ON
- ✅ **Always show account selector prompt:** ON

#### Google OAuth Credentials

**Client ID:**
```
15103610595-g4vhjjlggelj7gj4oumver6khe5eriui.apps.googleusercontent.com
```

**Client Secret:**
```
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
```

**Authorized Redirect URI:**
```
https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
```

#### Configured Scopes
- `openid` - OpenID Connect authentication
- `https://www.googleapis.com/auth/userinfo.email` - Access to user's email address
- `https://www.googleapis.com/auth/userinfo.profile` - Access to user's basic profile information

---

## 🔐 Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials

1. **Navigate to Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project (or create a new one)

2. **Enable Google+ API**
   ```
   Navigate: APIs & Services > Library
   Search: Google+ API
   Click: Enable
   ```

3. **Create OAuth 2.0 Client ID**
   ```
   Navigate: APIs & Services > Credentials
   Click: Create Credentials > OAuth client ID
   ```

4. **Configure OAuth Consent Screen** (if not already done)
   ```
   Application name: Derrimut 24:7 Gym Platform
   User support email: your-email@derrimut.aliaslabs.ai
   Developer contact: your-email@derrimut.aliaslabs.ai
   ```

5. **Create OAuth Client**
   ```
   Application type: Web application
   Name: Derrimut Platform Web OAuth
   
   Authorized JavaScript origins:
   - https://clerk.derrimut.aliaslabs.ai
   - https://derrimut.aliaslabs.ai
   
   Authorized redirect URIs:
   - https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
   ```

6. **Save Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Store securely (already configured in Clerk)

---

## ⚙️ Clerk Configuration Steps

### Step 1: Navigate to Social Connections

1. **Open Clerk Dashboard**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your production instance

2. **Access Social Connections**
   ```
   Dashboard > User & Authentication > Social Connections
   Find: Google
   Click: Configure or gear icon
   ```

### Step 2: Enable Google OAuth

1. **Enable Connection**
   ```
   ✅ Enable for sign-up and sign-in
   ```

2. **Configure Email Subaddress Blocking**
   ```
   ✅ Block email subaddresses
   ```
   **Why:** Prevents users from bypassing account restrictions using email subaddresses (e.g., `user+test@gmail.com`)

3. **Use Custom Credentials**
   ```
   ✅ Use custom credentials
   ```
   **Why:** Required for production instances. Allows you to use your own Google OAuth credentials.

### Step 3: Enter Google Credentials

1. **Client ID**
   ```
   15103610595-g4vhjjlggelj7gj4oumver6khe5eriui.apps.googleusercontent.com
   ```
   _(From Google Cloud Console)_

2. **Client Secret**
   ```
   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
   ```
   _(From Google Cloud Console - keep secret!)_

3. **Authorized Redirect URI**
   ```
   https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
   ```
   _(Pre-filled by Clerk, verify it matches Google Cloud Console)_

### Step 4: Configure Scopes

**Default Scopes (Pre-configured):**
- `openid` - Required for OpenID Connect
- `https://www.googleapis.com/auth/userinfo.email` - User email
- `https://www.googleapis.com/auth/userinfo.profile` - User profile

**Additional Scopes (if needed):**
- Add via the "Scopes" section in Clerk dashboard
- Click "Add" button to add custom scopes

### Step 5: Account Selector

```
✅ Always show account selector prompt
```
**Why:** Allows users to select which Google account to use when multiple accounts are available.

### Step 6: Save Configuration

1. Click **"Update"** button
2. Wait for confirmation
3. Test the connection

---

## 🧪 Testing Google OAuth

### Test Sign-In Flow

1. **Navigate to Sign-In Page**
   ```
   https://derrimut.aliaslabs.ai/sign-in
   ```

2. **Click "Continue with Google"**
   - Should redirect to Google account selection
   - Select a Google account
   - Authorize the application

3. **Verify Redirect**
   - Should redirect back to `https://derrimut.aliaslabs.ai`
   - User should be signed in
   - User profile should be populated from Google

### Test Sign-Up Flow

1. **Navigate to Sign-Up Page**
   ```
   https://derrimut.aliaslabs.ai/sign-up
   ```

2. **Click "Continue with Google"**
   - Select a Google account
   - New user account should be created
   - User should be signed in automatically

### Verify User Data

After successful OAuth:
- User email should be populated from Google
- User name should be populated from Google profile
- Profile picture should be available (if provided by Google)

---

## 🔍 Troubleshooting

### Issue: "Redirect URI mismatch"

**Problem:** Google OAuth fails with redirect URI error

**Solution:**
1. Verify redirect URI in Google Cloud Console matches exactly:
   ```
   https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback
   ```
2. Check Clerk dashboard has the same URI
3. Ensure no trailing slashes or extra characters

### Issue: "Invalid client credentials"

**Problem:** OAuth fails with credential error

**Solution:**
1. Verify Client ID and Client Secret in Clerk match Google Cloud Console
2. Ensure credentials are for the correct project
3. Check that Google+ API is enabled in Google Cloud Console

### Issue: "Email subaddresses not blocked"

**Problem:** Users can bypass restrictions using email subaddresses

**Solution:**
1. Verify "Block email subaddresses" is enabled in Clerk
2. Test with `user+test@gmail.com` - should be treated as `user@gmail.com`

### Issue: "Account selector not showing"

**Problem:** Users can't select which Google account to use

**Solution:**
1. Enable "Always show account selector prompt" in Clerk
2. Clear browser cookies and try again
3. Use incognito/private browsing mode

---

## 📊 Monitoring & Analytics

### Track OAuth Usage

**Clerk Dashboard:**
- Navigate to **User & Authentication > Social Connections**
- View Google OAuth statistics
- Monitor sign-up/sign-in rates

**Google Cloud Console:**
- Navigate to **APIs & Services > Credentials**
- View OAuth consent screen metrics
- Monitor API usage

### Key Metrics to Track

- **Sign-up frequency** - Google OAuth vs. email/password
- **Sign-in frequency** - Google OAuth vs. email/password
- **Error rates** - OAuth failures vs. successes
- **User retention** - OAuth users vs. email users

---

## 🔒 Security Considerations

### Credential Management

- ✅ **Client Secret:** Never expose in frontend code
- ✅ **Client ID:** Safe to expose (public)
- ✅ **Redirect URI:** Must match exactly in both systems
- ✅ **Scopes:** Only request necessary permissions

### Best Practices

1. **Use Custom Credentials**
   - Required for production
   - Better control over OAuth flow
   - Can customize consent screen

2. **Block Email Subaddresses**
   - Prevents account bypass attempts
   - Ensures consistent user identification

3. **Monitor OAuth Activity**
   - Watch for unusual sign-in patterns
   - Review OAuth errors regularly
   - Track credential usage

4. **Regular Credential Rotation**
   - Rotate Client Secret periodically
   - Update in both Clerk and Google Cloud Console
   - Test after rotation

---

## 📝 Environment Variables

**Note:** Google OAuth credentials are configured in Clerk dashboard, not in environment variables. However, ensure Clerk keys are properly configured:

```env
# Clerk Configuration (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk URLs (Auto-configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## 🔗 Related Documentation

- **Clerk Google OAuth Guide:** https://clerk.com/docs/authentication/social-connections/google
- **Google OAuth 2.0 Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Apple OAuth Setup:** `docs/APPLE-OAUTH-SETUP.md`
- **Clerk Configuration:** `ENVIRONMENT_KEYS_GUIDE.md`

---

## ✅ Configuration Checklist

- [x] Google Cloud Console project created
- [x] OAuth 2.0 credentials created
- [x] Authorized redirect URI configured
- [x] Google+ API enabled
- [x] Clerk Google OAuth enabled
- [x] Custom credentials configured
- [x] Scopes configured (openid, email, profile)
- [x] Email subaddress blocking enabled
- [x] Account selector enabled
- [x] Test sign-in successful
- [x] Test sign-up successful
- [x] User data syncing correctly

---

## 🚀 Next Steps

1. **Monitor OAuth Usage**
   - Track sign-up/sign-in rates
   - Monitor error rates
   - Review user feedback

2. **Consider Additional OAuth Providers**
   - Apple OAuth (already configured)
   - Facebook OAuth (if needed)
   - Microsoft OAuth (if needed)

3. **Optimize User Experience**
   - A/B test OAuth vs. email sign-up
   - Monitor conversion rates
   - Gather user feedback

---

**Last Updated:** January 9, 2025  
**Status:** ✅ Configured and Active  
**Next Review:** After first production deployment

