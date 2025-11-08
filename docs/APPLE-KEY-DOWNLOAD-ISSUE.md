# Apple OAuth Key Download Issue - Chromium Automation

## Issue
When using Chromium through browser automation tools, downloads may not save properly to the Downloads folder. The files appear in Chrome's download history but aren't accessible in the file system.

## Solution: Manual Download Required

Since Apple only allows downloading the private key **once**, and the automated download didn't save properly, you have two options:

### Option 1: Check if Key is Still Available (Recommended First Step)

1. **Navigate to Apple Developer Console:**
   - Go to: https://developer.apple.com/account/resources/authkeys/list
   - Look for: "Derrimut OAuth Private Key" (Key ID: `7G878XF298` or `F9NW26743D`)

2. **Check Download Status:**
   - If button shows "Downloaded" → Key was already downloaded (can't re-download)
   - If button shows "Download" → You can still download it

3. **If Download is Still Available:**
   - Use a **regular browser** (not automated Chromium)
   - Click "Download" button
   - Save the `.p8` file immediately to a secure location

### Option 2: Use Existing Key (If You Have It)

If you previously downloaded a key for Sign In with Apple, you can reuse it:

**Key Information You Have:**
- **Key ID:** `7G878XF298` (most recent) or `F9NW26743D` (earlier)
- **Team ID:** `5TLP523VK4`
- **Services ID:** `ai.aliaslabs.derrimut.web`
- **Key Name:** Derrimut OAuth Private Key

### Option 3: Create New Key (If Download Failed)

If the download failed and you can't access the key:

1. **Create a New Key:**
   - Go to: https://developer.apple.com/account/resources/authkeys/add
   - Name: "Derrimut OAuth Private Key v2"
   - Enable: Sign In with Apple
   - Configure with Primary App ID: `5TLP523VK4.ai.aliaslabs`
   - Register and download immediately

2. **Important:** Use a regular browser (Safari, Chrome, Firefox) - NOT automated Chromium

## What You Need for Clerk Configuration

Once you have the `.p8` file:

1. **Service ID:** `ai.aliaslabs.derrimut.web`
2. **Key ID:** `7G878XF298` (or whichever key you use)
3. **Team ID:** `5TLP523VK4`
4. **Private Key:** Contents of the `.p8` file (including BEGIN/END lines)

## File Location Check

The downloaded files should be:
- **Filename pattern:** UUID format (e.g., `1dbf95f2-017d-47a0-8ba6-c2512267a25b`)
- **Size:** ~257 bytes
- **Extension:** `.p8` (but might not show extension)
- **Location:** Usually `~/Downloads/` but Chromium automation may save elsewhere

## Next Steps

1. **Try Option 1 first** - Check if download is still available
2. **If not available** - Use Option 3 to create a new key
3. **Always use regular browser** for downloading Apple keys
4. **Save key immediately** to secure location (password manager, secrets manager)
5. **Never commit** the `.p8` file to Git

## Troubleshooting Chromium Downloads

If you need to use Chromium automation in the future:

1. **Set explicit download path** in Chromium preferences
2. **Check Chromium's download settings:**
   ```bash
   # Check Chromium download location
   defaults read com.google.Chromium.plist
   ```
3. **Use regular browser** for critical one-time downloads like Apple keys

---

**Status:** Key download completed but file not accessible due to Chromium automation limitations.

**Action Required:** Manually download key using regular browser or create new key.

