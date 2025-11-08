# 🎙️ Vapi Quick Reference

## API Keys

- **Private Key**: `2cd34963-f7ed-4794-9fbb-76549b614bd0` (Backend/CLI)
- **Public Key**: `f90a42da-11c9-490e-a9ec-111c86ff45a7` (Frontend)
- **CLI Key**: `bf0dbb4c-f023-4ada-a123-a816534de597`
- **ARA Key**: `206c6c8b-7b22-4c66-96b0-ec45338e1295`

## Quick Commands

```bash
# Setup Vapi workflow
npm run vapi:setup

# List workflows (via CLI - may have compatibility issues)
npm run vapi:list-workflows

# List assistants (via CLI - may have compatibility issues)
npm run vapi:list-assistants

# Authenticate with Vapi
vapi login

# Make a test call
vapi call create --workflow-id YOUR_WORKFLOW_ID --phone-number YOUR_PHONE
```

## Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_VAPI_API_KEY=f90a42da-11c9-490e-a9ec-111c86ff45a7
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here
```

## Workflow Configuration

### Endpoint
- **URL**: `https://YOUR_CONVEX_DEPLOYMENT_URL/vapi/generate-program`
- **Method**: POST
- **Function**: `collect_fitness_data`

### Required Parameters
- `age` (number)
- `height` (string)
- `weight` (string)
- `workout_days` (number)
- `fitness_goal` (string)
- `fitness_level` (string)
- `injuries` (string, optional)
- `dietary_restrictions` (string, optional)

### Voice Settings
- Provider: Cartesia
- Voice ID: `71a7ad14-091c-4e8e-a314-022ece01c121`
- Model: sonic-2

## Dashboard

- **Vapi Dashboard**: https://dashboard.vapi.ai
- **Documentation**: https://docs.vapi.ai

## Troubleshooting

If CLI commands fail due to compatibility issues, use the Vapi dashboard instead. All features are available via the web interface.

