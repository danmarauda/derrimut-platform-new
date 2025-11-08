# 🚀 Stripe + Convex Quick Start

## ⚡ One-Command Setup

### Development
```bash
bun run stripe:setup-full
```

### Production
```bash
bun run stripe:setup-prod
```

## 🧪 Testing

```bash
# Test dev integration
bun run stripe:test

# Test prod integration
bun run stripe:test-prod
```

## 📚 Documentation

- **`STRIPE_CONVEX_RULES.md`** - Complete guide with all rules and best practices
- **`STRIPE_CONVEX_MEMORIES.md`** - Key learnings and patterns to remember

## 🎯 Key Rules (Remember These!)

1. **Convex functions CANNOT access `.env.local`** - Always set variables via CLI/Dashboard
2. **Dev and Prod are separate** - Set variables for both with `--prod` flag
3. **Always validate** environment variables before using them
4. **Webhook secrets are per-endpoint** - Each environment has its own secret

## 🔧 Manual Commands

### Set Environment Variables
```bash
# Dev (default)
bunx convex env set STRIPE_SECRET_KEY "sk_test_..."

# Prod (explicit)
bunx convex env set STRIPE_SECRET_KEY "sk_live_..." --prod
```

### Check Variables
```bash
# Dev
bunx convex env list

# Prod
bunx convex env list --prod
```

## 📋 Setup Checklist

- [ ] Stripe products created
- [ ] Product IDs updated in code
- [ ] Webhook configured in Stripe Dashboard
- [ ] Convex env vars set (dev)
- [ ] Convex env vars set (prod)
- [ ] Webhook tested

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| `Neither apiKey nor config.authenticator provided` | Set `STRIPE_SECRET_KEY` in Convex |
| `Webhook signature verification failed` | Check webhook secret matches Stripe Dashboard |
| Works in dev, fails in prod | Set variables with `--prod` flag |

---

**See `STRIPE_CONVEX_RULES.md` for complete documentation!**

