# 🔐 OAuth Providers - Quick Reference

**Last Updated:** January 9, 2025  
**Platform:** Derrimut 24:7 Gym

---

## ✅ Configured OAuth Providers

### Google OAuth
- **Status:** ✅ Active
- **Client ID:** `15103610595-g4vhjjlggelj7gj4oumver6khe5eriui.apps.googleusercontent.com`
- **Redirect URI:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`
- **Scopes:** openid, email, profile
- **Documentation:** `docs/GOOGLE-OAUTH-SETUP.md`

### Apple OAuth
- **Status:** ✅ Active
- **Service ID:** `ai.aliaslabs.derrimut.web`
- **Return URL:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`
- **Documentation:** `docs/APPLE-OAUTH-SETUP.md`

---

## 🔗 Common OAuth URLs

**Clerk Domain:** `clerk.derrimut.aliaslabs.ai`  
**OAuth Callback:** `https://clerk.derrimut.aliaslabs.ai/v1/oauth_callback`  
**Clerk Instance:** `busy-cow-62.clerk.accounts.dev`

---

## 📋 Quick Checklist

### Google OAuth
- [x] Google Cloud Console project created
- [x] OAuth 2.0 credentials configured
- [x] Redirect URI matches in both systems
- [x] Clerk Google OAuth enabled
- [x] Custom credentials configured
- [x] Scopes configured
- [x] Test sign-in successful

### Apple OAuth
- [x] Apple Developer account configured
- [x] Service ID created
- [x] Private key generated
- [x] Clerk Apple OAuth enabled
- [x] Custom credentials configured
- [x] Return URL verified
- [x] Test sign-in successful

---

## 🧪 Testing

**Sign-In URL:** `https://derrimut.aliaslabs.ai/sign-in`  
**Sign-Up URL:** `https://derrimut.aliaslabs.ai/sign-up`

Both pages should show:
- "Continue with Google" button
- "Continue with Apple" button (if configured)
- Email/password option

---

## 🔒 Security Notes

- ✅ Client secrets stored in Clerk (not in code)
- ✅ Redirect URIs match exactly
- ✅ Email subaddress blocking enabled (Google)
- ✅ Account selector enabled (both providers)

---

**For detailed setup instructions, see:**
- `docs/GOOGLE-OAUTH-SETUP.md`
- `docs/APPLE-OAUTH-SETUP.md`

