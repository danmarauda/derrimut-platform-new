# 🚀 Bun Setup Guide

This project is configured to use **Bun** as the package manager and runtime.

## Prerequisites

Install Bun if you haven't already:
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or via Homebrew
brew install bun
```

## Quick Start

### Install Dependencies
```bash
bun install
```

### Development
```bash
bun dev
```

### Build
```bash
bun run build
```

### Start Production Server
```bash
bun start
```

## Available Scripts

All scripts work with Bun:

```bash
# Development
bun dev                    # Start dev server with Turbopack

# Building
bun run build             # Build for production
bun start                 # Start production server

# Linting
bun run lint              # Run ESLint

# Stripe Setup
bun run stripe:create-products      # Create Stripe products
bun run stripe:update-ids           # Update product IDs in code
bun run stripe:configure-webhooks  # Configure webhooks
bun run stripe:test-webhooks       # Test webhook delivery
bun run stripe:setup               # Complete Stripe setup
```

## Convex with Bun

Convex works seamlessly with Bun:

```bash
# Initialize Convex (one-time)
bunx convex dev --once

# Run Convex in watch mode
bunx convex dev

# View logs
bunx convex logs --history 20
```

## Benefits of Bun

- ⚡ **Faster** - Up to 4x faster than npm
- 📦 **Built-in bundler** - No need for separate tools
- 🔧 **TypeScript support** - Built-in TypeScript runtime
- 🚀 **Better performance** - Optimized JavaScript runtime

## Migration from npm

If you were using npm before:

1. **Remove node_modules and lock files:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install with Bun:**
   ```bash
   bun install
   ```

3. **Use Bun commands:**
   - `npm install` → `bun install`
   - `npm run dev` → `bun dev`
   - `npm run build` → `bun run build`
   - `npx` → `bunx`

## Scripts Compatibility

All scripts in `package.json` work with both Bun and npm. The project is configured to work with either, but Bun is recommended for better performance.

## Troubleshooting

### "bun: command not found"
Install Bun: https://bun.sh/docs/installation

### "Module not found" errors
Run `bun install` to ensure all dependencies are installed.

### Convex issues
Convex CLI works with Bun. Use `bunx` instead of `npx`:
```bash
bunx convex dev
```

---

**Note:** This project is fully compatible with Bun. All npm commands can be replaced with Bun equivalents.

