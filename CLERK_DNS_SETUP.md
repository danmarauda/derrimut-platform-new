# 🔧 Clerk DNS Configuration Guide

## DNS Records Required

You need to add these **5 CNAME records** at your DNS provider (where `aliaslabs.ai` is hosted):

### 1. Frontend API
```
Name: clerk.derrimut
Type: CNAME
Value: frontend-api.clerk.services
```

### 2. Account Portal (This is the one causing the error!)
```
Name: accounts.derrimut
Type: CNAME
Value: accounts.clerk.services
```

### 3. Email
```
Name: clkmail.derrimut
Type: CNAME
Value: mail.8wln2bwryw6c.clerk.services
```

### 4. Email DKIM Key 1
```
Name: clk._domainkey.derrimut
Type: CNAME
Value: dkim1.8wln2bwryw6c.clerk.services
```

### 5. Email DKIM Key 2
```
Name: clk2._domainkey.derrimut
Type: CNAME
Value: dkim2.8wln2bwryw6c.clerk.services
```

## How to Add DNS Records

### Step 1: Identify Your DNS Provider
- Where did you register/buy `aliaslabs.ai`?
- Common providers: Cloudflare, AWS Route53, Google Domains, Namecheap, GoDaddy

### Step 2: Log in to DNS Management
- Log in to your DNS provider's dashboard
- Navigate to DNS management for `aliaslabs.ai`

### Step 3: Add Each CNAME Record
- Click "Add Record" or "Create Record"
- Select type: **CNAME**
- Enter the **Name** (e.g., `clerk.derrimut`)
- Enter the **Value/Target** (e.g., `frontend-api.clerk.services`)
- Set TTL to 300 (or default)
- Click "Save" or "Add"

### Step 4: Repeat for All 5 Records
- Add all 5 CNAME records listed above
- Make sure names match exactly (case-sensitive)

### Step 5: Wait for Propagation
- DNS changes can take 5 minutes to 48 hours
- Usually takes 5-15 minutes
- Check propagation: https://dnschecker.org

### Step 6: Verify in Clerk Dashboard
- Go back to Clerk Dashboard → Settings → Domains
- Click "Verify" next to each domain
- Status should change to "Verified" ✅

## Quick DNS Check Commands

After adding records, verify they're working:

```bash
# Check Frontend API
dig clerk.derrimut.aliaslabs.ai CNAME

# Check Account Portal (the one causing issues)
dig accounts.derrimut.aliaslabs.ai CNAME

# Check Email
dig clkmail.derrimut.aliaslabs.ai CNAME
```

## Alternative: Use Clerk's Default Domain (Easier!)

If you don't want to set up custom DNS, you can:

1. **Remove custom domain in Clerk Dashboard**
2. **Use Clerk's default domain** (works immediately)
3. **Just add `derrimut.aliaslabs.ai` to Allowed Origins**

This avoids DNS setup entirely!

## Troubleshooting

### DNS Not Propagating?
- Wait longer (up to 48 hours)
- Check TTL value (lower = faster updates)
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Still Getting Errors?
- Verify DNS records are correct (use `dig` command)
- Check for typos in CNAME values
- Ensure you're editing the right DNS zone (`aliaslabs.ai`)

### Want to Skip DNS Setup?
- Remove custom domain in Clerk
- Use default Clerk domain
- Add `derrimut.aliaslabs.ai` to Allowed Origins only

