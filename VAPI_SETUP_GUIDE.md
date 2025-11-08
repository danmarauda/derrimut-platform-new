# 🎙️ Vapi Voice Agent Setup Guide

This guide will help you configure and set up the Vapi voice agent for the Derrimut Fitness Platform.

## 📋 Prerequisites

- Vapi account (already authenticated)
- Convex deployment URL
- API keys (provided below)

## 🔑 API Keys

Your Vapi API keys:

- **Private API Key** (for backend/CLI): `2cd34963-f7ed-4794-9fbb-76549b614bd0`
- **Public API Key** (for frontend): `f90a42da-11c9-490e-a9ec-111c86ff45a7`
- **Vapi CLI Key**: `bf0dbb4c-f023-4ada-a123-a816534de597`
- **ARA Key**: `206c6c8b-7b22-4c66-96b0-ec45338e1295`

## 🚀 Quick Setup

### Option 1: Automated Setup Script

```bash
# Set your Convex URL
export CONVEX_URL="https://your-deployment.convex.site"

# Run the setup script
node scripts/setup-vapi.js
```

### Option 2: Manual Setup via Dashboard

1. **Go to Vapi Dashboard**
   - Visit: https://dashboard.vapi.ai
   - Log in with your account

2. **Create a New Workflow**
   - Click "Workflows" → "Create Workflow"
   - Name: "Derrimut Fitness Program Generator"

3. **Configure the Workflow**

   **Model Settings:**
   - Provider: OpenAI
   - Model: GPT-4o-mini (or GPT-4o)
   - System Message:
   ```
   You are a friendly and professional fitness coach for Derrimut Gym. Your goal is to collect fitness information from users through a natural conversation. 

   Ask about:
   1. Age
   2. Height and weight
   3. Any injuries or physical limitations
   4. How many days per week they can work out
   5. Their primary fitness goal (weight loss, muscle gain, endurance, general fitness, etc.)
   6. Their current fitness level (beginner, intermediate, advanced)
   7. Any dietary restrictions or preferences

   Be conversational and encouraging. Once you have all the information, use the collect_fitness_data function to submit it.
   ```

   **Function Calling:**
   - Enable function calling
   - Add function:
   ```json
   {
     "name": "collect_fitness_data",
     "description": "Submit collected fitness information to generate personalized workout and diet plans",
     "parameters": {
       "type": "object",
       "properties": {
         "age": {
           "type": "number",
           "description": "User's age"
         },
         "height": {
           "type": "string",
           "description": "User's height (e.g., '5ft 10in' or '178cm')"
         },
         "weight": {
           "type": "string",
           "description": "User's weight (e.g., '75kg' or '165lbs')"
         },
         "injuries": {
           "type": "string",
           "description": "Any injuries or physical limitations (use 'none' if none)"
         },
         "workout_days": {
           "type": "number",
           "description": "Number of days per week available for workouts"
         },
         "fitness_goal": {
           "type": "string",
           "description": "Primary fitness goal"
         },
         "fitness_level": {
           "type": "string",
           "description": "Current fitness level"
         },
         "dietary_restrictions": {
           "type": "string",
           "description": "Dietary restrictions or preferences (use 'none' if none)"
         }
       },
       "required": ["age", "height", "weight", "workout_days", "fitness_goal", "fitness_level"]
     }
   }
   ```

   **Server URL:**
   - URL: `https://YOUR_CONVEX_DEPLOYMENT_URL/vapi/generate-program`
   - Method: POST
   - This endpoint receives the function call data and generates the fitness plans

   **Voice Settings:**
   - Provider: Cartesia
   - Voice ID: `71a7ad14-091c-4e8e-a314-022ece01c121`
   - Model: sonic-2
   - Speed: 1.0

   **First Message:**
   ```
   Hi! I'm your Derrimut AI fitness coach. I'm here to help create a personalized workout and nutrition plan just for you. Let's start by getting to know you better. What's your primary fitness goal?
   ```

   **End Call Function:**
   - Enable "End Call Function"
   - Function Name: `collect_fitness_data`
   - This ensures the function is called when the conversation ends

4. **Save and Test**
   - Save the workflow
   - Copy the Workflow ID
   - Test the workflow using the test button

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Vapi Voice AI
NEXT_PUBLIC_VAPI_API_KEY=f90a42da-11c9-490e-a9ec-111c86ff45a7
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here
```

Also add to Convex environment variables (via Convex dashboard):

```env
# Vapi (if needed for webhooks)
VAPI_PRIVATE_KEY=2cd34963-f7ed-4794-9fbb-76549b614bd0
```

## 📡 Webhook Configuration

The workflow calls your Convex HTTP endpoint at:
```
POST https://YOUR_CONVEX_DEPLOYMENT_URL/vapi/generate-program
```

This endpoint expects a JSON payload with:
```json
{
  "user_id": "clerk_user_id",
  "age": 30,
  "height": "5ft 10in",
  "weight": "75kg",
  "injuries": "none",
  "workout_days": 4,
  "fitness_goal": "muscle gain",
  "fitness_level": "intermediate",
  "dietary_restrictions": "none"
}
```

## 🧪 Testing

### Test via CLI

```bash
# Make a test call
vapi call create \
  --workflow-id YOUR_WORKFLOW_ID \
  --phone-number YOUR_PHONE_NUMBER
```

### Test via Frontend

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/generate-program`
3. Click "Start Call"
4. Have a conversation with the AI
5. Verify the fitness plan is generated and saved

## 📝 Workflow Variables

The workflow can receive these variables when starting a call:

- `full_name`: User's full name (passed from frontend)
- `user_id`: Clerk user ID (passed from frontend)

These are set in `src/app/generate-program/page.tsx`:

```typescript
await vapi.start(undefined, undefined, undefined, workflowId, {
  variableValues: {
    full_name: fullName,
    user_id: user?.id,
  },
});
```

## 🔍 Troubleshooting

### CLI Compatibility Issues

If you encounter CLI compatibility errors, use the dashboard instead:
- The Vapi dashboard is always up-to-date
- All features are available via the web interface

### Workflow Not Calling Endpoint

1. Check the server URL is correct
2. Verify Convex endpoint is deployed
3. Check Convex logs for errors
4. Ensure the function name matches exactly

### Function Not Being Called

1. Verify function calling is enabled
2. Check function name matches: `collect_fitness_data`
3. Ensure all required parameters are collected
4. Check "End Call Function" is configured

## 📚 Additional Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [Vapi Dashboard](https://dashboard.vapi.ai)
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)

## ✅ Checklist

- [ ] Vapi account authenticated
- [ ] Workflow created in dashboard
- [ ] Function calling configured
- [ ] Server URL set to Convex endpoint
- [ ] Voice settings configured
- [ ] Environment variables added to `.env.local`
- [ ] Workflow tested successfully
- [ ] Frontend integration tested

