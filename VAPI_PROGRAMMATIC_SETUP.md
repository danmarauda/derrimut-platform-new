# 🎙️ Vapi Programmatic Setup Guide

This guide shows you how to set up Vapi workflows **completely programmatically** using CLI, REST API, or MCP Server - no manual dashboard work required!

## 🚀 Quick Start (Fully Automated)

### Option 1: Automated REST API Setup (Recommended)

```bash
# Set your Convex URL and run
CONVEX_URL=https://your-deployment.convex.site npm run vapi:setup-auto

# Or pass as argument
npm run vapi:setup-auto -- --convex-url https://your-deployment.convex.site
```

This will:
- ✅ Check for existing workflows
- ✅ Create a new workflow if none exists
- ✅ Configure all settings automatically
- ✅ Output environment variables ready to copy

### Option 2: Using Vapi CLI

```bash
# Authenticate (already done)
vapi login

# List workflows
npm run vapi:list-workflows

# Create workflow via CLI (if supported)
vapi workflow create --name "Derrimut Fitness" --server-url "https://your-deployment.convex.site/vapi/generate-program"
```

### Option 3: MCP Server Integration

```bash
# Test MCP server connection
npm run vapi:mcp

# This will show you how to integrate with Claude Desktop
```

## 📋 Detailed Setup Methods

### Method 1: Automated Script (REST API)

The `setup-vapi-auto.js` script uses Vapi's REST API directly:

```bash
# Basic usage
node scripts/setup-vapi-auto.js --convex-url https://your-deployment.convex.site

# With environment variables
export CONVEX_URL=https://your-deployment.convex.site
export VAPI_PRIVATE_KEY=your_private_key
node scripts/setup-vapi-auto.js

# Update existing workflow
node scripts/setup-vapi-auto.js --convex-url https://your-deployment.convex.site --update true
```

**What it does:**
1. Checks for existing Derrimut workflows
2. Creates new workflow if none found
3. Configures:
   - Model: GPT-4o-mini
   - Voice: Cartesia (sonic-2)
   - Function calling: `collect_fitness_data`
   - Server URL: Your Convex endpoint
   - End call function: Automatically calls function when call ends
4. Outputs workflow ID and environment variables

### Method 2: Direct REST API Calls

You can also call the Vapi API directly using curl or any HTTP client:

```bash
curl -X POST https://api.vapi.ai/workflow \
  -H "Authorization: Bearer 2cd34963-f7ed-4794-9fbb-76549b614bd0" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Derrimut Fitness Program Generator",
    "serverUrl": "https://your-deployment.convex.site/vapi/generate-program",
    "model": {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "functions": [...]
    },
    "voice": {
      "provider": "cartesia",
      "voiceId": "71a7ad14-091c-4e8e-a314-022ece01c121",
      "model": "sonic-2"
    }
  }'
```

### Method 3: MCP Server (For Claude Desktop)

The MCP server allows you to manage Vapi through Claude Desktop:

1. **Test MCP Connection:**
   ```bash
   npm run vapi:mcp
   ```

2. **Configure Claude Desktop:**
   
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
   
   ```json
   {
     "mcpServers": {
       "vapi-mcp": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://mcp.vapi.ai/mcp",
           "--header",
           "Authorization: Bearer 2cd34963-f7ed-4794-9fbb-76549b614bd0"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop** - You'll now have Vapi tools available!

## 🔧 Script Options

### setup-vapi-auto.js

Fully automated workflow creation:

```bash
# Required
--convex-url <url>     Convex deployment URL

# Optional
--update true          Update existing workflow instead of creating new
```

**Environment Variables:**
- `VAPI_PRIVATE_KEY` - Your private API key (defaults to provided key)
- `VAPI_PUBLIC_KEY` - Your public API key (defaults to provided key)
- `CONVEX_URL` - Convex deployment URL (can be passed as arg instead)

### setup-vapi-mcp.js

MCP server integration helper:

```bash
node scripts/setup-vapi-mcp.js
```

Shows:
- Available MCP tools
- Claude Desktop configuration
- Connection status

## 📝 Workflow Configuration

The automated script creates a workflow with:

**Model Settings:**
- Provider: OpenAI
- Model: GPT-4o-mini
- System message: Fitness coach persona
- Function calling: Enabled

**Function: `collect_fitness_data`**
- Collects: age, height, weight, injuries, workout_days, fitness_goal, fitness_level, dietary_restrictions
- Required fields: age, height, weight, workout_days, fitness_goal, fitness_level

**Voice Settings:**
- Provider: Cartesia
- Voice ID: `71a7ad14-091c-4e8e-a314-022ece01c121`
- Model: sonic-2
- Speed: 1.0

**Server Integration:**
- URL: `{convexUrl}/vapi/generate-program`
- Method: POST
- End call function: Calls `collect_fitness_data` when call ends

## 🧪 Testing

After setup, test your workflow:

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to generate-program page
open http://localhost:3000/generate-program

# 3. Click "Start Call"
# 4. Have a conversation with the AI
# 5. Verify fitness plan is generated
```

## 🔍 Troubleshooting

### API Errors

If you get API errors:
1. Verify your API key is correct
2. Check API key permissions
3. Ensure Convex URL is accessible
4. Verify endpoint exists: `{convexUrl}/vapi/generate-program`

### Workflow Not Found

If workflow creation fails:
1. Check Vapi API status: https://status.vapi.ai
2. Verify API key has workflow creation permissions
3. Try manual creation via dashboard as fallback

### MCP Connection Issues

If MCP server doesn't connect:
1. Verify API key is correct
2. Check network access to `mcp.vapi.ai`
3. Ensure `npx` is available
4. Try direct API calls instead

## 📚 API Reference

### Vapi REST API

- **Base URL**: `https://api.vapi.ai`
- **Authentication**: Bearer token
- **Workflow Endpoint**: `POST /workflow`
- **List Workflows**: `GET /workflow`
- **Get Workflow**: `GET /workflow/{id}`
- **Update Workflow**: `PATCH /workflow/{id}`

### MCP Server

- **URL**: `https://mcp.vapi.ai/mcp`
- **Protocol**: JSON-RPC 2.0
- **Authentication**: Bearer token in Authorization header

## ✅ Complete Automation Example

```bash
#!/bin/bash
# Fully automated Vapi setup

# Set variables
export CONVEX_URL="https://your-deployment.convex.site"
export VAPI_PRIVATE_KEY="2cd34963-f7ed-4794-9fbb-76549b614bd0"
export VAPI_PUBLIC_KEY="f90a42da-11c9-490e-a9ec-111c86ff45a7"

# Run automated setup
npm run vapi:setup-auto

# The script will output environment variables
# Copy them to .env.local
```

## 🎯 Next Steps

1. ✅ Run automated setup: `npm run vapi:setup-auto`
2. ✅ Copy environment variables to `.env.local`
3. ✅ Test the workflow
4. ✅ Deploy to production

## 📖 Additional Resources

- [Vapi API Documentation](https://docs.vapi.ai/api)
- [Vapi CLI Documentation](https://docs.vapi.ai/cli)
- [Vapi MCP Server](https://docs.vapi.ai/sdk/mcp-server)
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)

