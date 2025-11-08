#!/bin/bash

###############################################################################
# Sentry Setup via Vercel CLI
# Automated setup script for Sentry integration
#
# Usage: bash scripts/setup-sentry-cli.sh
###############################################################################

set -e  # Exit on error

echo ""
echo "🚀 Setting up Sentry via Vercel CLI..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo ""
    echo "Installing Vercel CLI globally..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi

echo -e "${BLUE}📦 Vercel CLI version:${NC}"
vercel --version
echo ""

# Step 1: Login to Vercel (if not already logged in)
echo -e "${YELLOW}Step 1: Checking Vercel login...${NC}"
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✅ Already logged in to Vercel${NC}"
    echo -e "   Account: $(vercel whoami)"
else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please log in to Vercel:"
    vercel login
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
fi
echo ""

# Step 2: Link project (if not already linked)
echo -e "${YELLOW}Step 2: Checking project link...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Project already linked to Vercel${NC}"
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    echo -e "   Project ID: ${PROJECT_ID}"
else
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo ""
    echo "Linking project to Vercel..."
    vercel link
    echo -e "${GREEN}✅ Project linked to Vercel${NC}"
fi
echo ""

# Step 3: Add Sentry Integration
echo -e "${YELLOW}Step 3: Setting up Sentry integration...${NC}"
echo ""
echo "Choose setup method:"
echo "  1. Add Sentry integration automatically (recommended)"
echo "  2. Configure environment variables manually"
echo "  3. Skip (already configured)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Adding Sentry integration via Vercel CLI...${NC}"
        echo ""
        vercel integrations add sentry
        echo -e "${GREEN}✅ Sentry integration added${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}Manual environment variable setup...${NC}"
        echo ""
        echo "Please enter your Sentry DSN:"
        echo "(Get it from: https://sentry.io/settings/projects/YOUR_PROJECT/keys/)"
        read -p "NEXT_PUBLIC_SENTRY_DSN: " SENTRY_DSN

        if [ -n "$SENTRY_DSN" ]; then
            echo "$SENTRY_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development
            echo -e "${GREEN}✅ NEXT_PUBLIC_SENTRY_DSN configured${NC}"
        fi

        echo ""
        read -p "SENTRY_ORG (optional, press Enter to skip): " SENTRY_ORG
        if [ -n "$SENTRY_ORG" ]; then
            echo "$SENTRY_ORG" | vercel env add SENTRY_ORG production preview development
            echo -e "${GREEN}✅ SENTRY_ORG configured${NC}"
        fi

        echo ""
        read -p "SENTRY_PROJECT (optional, press Enter to skip): " SENTRY_PROJECT
        if [ -n "$SENTRY_PROJECT" ]; then
            echo "$SENTRY_PROJECT" | vercel env add SENTRY_PROJECT production preview development
            echo -e "${GREEN}✅ SENTRY_PROJECT configured${NC}"
        fi

        echo ""
        read -p "SENTRY_AUTH_TOKEN (optional, press Enter to skip): " SENTRY_AUTH_TOKEN
        if [ -n "$SENTRY_AUTH_TOKEN" ]; then
            echo "$SENTRY_AUTH_TOKEN" | vercel env add SENTRY_AUTH_TOKEN production preview development
            echo -e "${GREEN}✅ SENTRY_AUTH_TOKEN configured${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}Skipping Sentry integration setup${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
echo ""

# Step 4: Pull environment variables
echo -e "${YELLOW}Step 4: Pulling environment variables to .env.local...${NC}"
vercel env pull .env.local
echo -e "${GREEN}✅ Environment variables pulled${NC}"
echo ""

# Step 5: Verify Sentry configuration
echo -e "${YELLOW}Step 5: Verifying Sentry configuration...${NC}"
echo ""
node scripts/verify-sentry.js
VERIFY_EXIT_CODE=$?
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $VERIFY_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 Sentry Setup Complete!${NC}"
    echo ""
    echo "✅ Vercel CLI configured"
    echo "✅ Project linked to Vercel"
    echo "✅ Sentry integration added"
    echo "✅ Environment variables configured"
    echo "✅ Local .env.local updated"
    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo ""
    echo "1. Test error tracking:"
    echo "   npm run dev"
    echo "   curl http://localhost:3000/api/test-sentry?type=error"
    echo ""
    echo "2. Check Sentry dashboard:"
    echo "   https://sentry.io"
    echo ""
    echo "3. Deploy to preview:"
    echo "   vercel"
    echo ""
    echo "4. Deploy to production:"
    echo "   vercel --prod"
    echo ""
else
    echo -e "${RED}⚠️  Sentry Setup Incomplete${NC}"
    echo ""
    echo "Some environment variables are missing."
    echo "Please complete the setup manually:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add NEXT_PUBLIC_SENTRY_DSN"
    echo ""
    echo "Or run this script again and choose option 2."
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
