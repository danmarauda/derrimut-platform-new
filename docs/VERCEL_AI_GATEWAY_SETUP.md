# Vercel AI SDK 6 & AI Gateway Integration

## ✅ Setup Complete

This project now uses **Vercel AI SDK** with **Vercel AI Gateway** for AI model management, providing:
- ✅ Rate limiting
- ✅ Cost tracking
- ✅ Unified API
- ✅ Monitoring and analytics
- ✅ Fallback handling

## 📦 Installed Packages

- `ai@5.0.89` - Vercel AI SDK
- `@ai-sdk/google@2.0.29` - Google Generative AI provider

## 🏗️ Architecture

### 1. AI Gateway API Route
**Location:** `src/app/api/ai/generate/route.ts`

This Next.js API route provides a unified interface for AI requests:
- Uses Vercel AI Gateway if `AI_GATEWAY_API_KEY` is set
- Falls back to direct provider if gateway is not configured
- Supports Google Gemini models (gemini-2.5-flash)
- Returns structured JSON when requested

### 2. AI Gateway Utility
**Location:** `src/lib/ai-gateway.ts`

Helper functions for generating text:
- `generateTextWithGateway()` - Generate text with gateway support
- `generateStructuredJSON()` - Generate structured JSON responses

### 3. Convex HTTP Integration
**Location:** `convex/http.ts`

The `/vapi/generate-program` endpoint now:
- Calls the Next.js AI Gateway API route
- Uses Vercel AI Gateway for workout and diet plan generation
- Maintains backward compatibility

## 🔧 Environment Variables

### Required
- `GEMINI_API_KEY` - Google Gemini API key (for AI plan generation)

### Optional (for Gateway features)
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key
  - Get from: https://vercel.com/ai-gateway
  - Enables rate limiting, cost tracking, and monitoring
  - If not set, falls back to direct provider

### VAPI (Separate - Still Works)
- `NEXT_PUBLIC_VAPI_API_KEY` - VAPI API key
- `NEXT_PUBLIC_VAPI_WORKFLOW_ID` - VAPI workflow ID

## 🚀 Usage

### Direct API Call

```typescript
// Call the AI Gateway API route
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    model: 'gemini-2.5-flash',
    temperature: 0.4,
    responseFormat: { type: 'json_object' }, // Optional
  }),
});

const { text, usage, finishReason } = await response.json();
```

### Using Utility Functions

```typescript
import { generateTextWithGateway } from '@/lib/ai-gateway';

const result = await generateTextWithGateway({
  model: 'gemini-2.5-flash',
  prompt: 'Your prompt here',
  temperature: 0.4,
  responseFormat: { type: 'json_object' },
});

console.log(result.text);
console.log(result.usage);
```

## 🔄 Migration from Direct Google Gemini

### Before
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const result = await model.generateContent(prompt);
```

### After
```typescript
// Via API route (recommended)
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt, model: 'gemini-2.5-flash' }),
});

// Or via utility
import { generateTextWithGateway } from '@/lib/ai-gateway';
const result = await generateTextWithGateway({ model: 'gemini-2.5-flash', prompt });
```

## ✅ VAPI Integration Status

**VAPI is completely separate and unaffected by this migration.**

- ✅ VAPI voice AI still works exactly as before
- ✅ No changes needed to VAPI configuration
- ✅ VAPI calls Convex HTTP endpoint `/vapi/generate-program`
- ✅ Convex endpoint now uses AI Gateway internally

## 📊 Benefits of AI Gateway

1. **Rate Limiting** - Prevent API abuse
2. **Cost Tracking** - Monitor spending across providers
3. **Unified API** - Single interface for multiple providers
4. **Monitoring** - Track usage and performance
5. **Fallback Handling** - Automatic retries and fallbacks

## 🔍 Testing

### Test AI Gateway API Route
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, world!",
    "model": "gemini-2.5-flash",
    "temperature": 0.4
  }'
```

### Test VAPI Integration
1. Navigate to `/generate-program`
2. Click "Start Consultation"
3. Complete voice consultation
4. Verify plan generation works

## 📝 Next Steps

1. **Get AI Gateway API Key** (optional but recommended)
   - Visit: https://vercel.com/ai-gateway
   - Create API key
   - Add to environment variables: `AI_GATEWAY_API_KEY`

2. **Configure in Vercel**
   - Add `AI_GATEWAY_API_KEY` to Vercel environment variables
   - Add `GEMINI_API_KEY` if not already set

3. **Monitor Usage**
   - Check Vercel dashboard for AI Gateway metrics
   - Track costs and usage patterns

## 🐛 Troubleshooting

### Gateway Not Working
- Check `AI_GATEWAY_API_KEY` is set correctly
- Verify API key is valid in Vercel dashboard
- Check network requests in browser DevTools

### Fallback to Direct Provider
- If `AI_GATEWAY_API_KEY` is not set, system automatically uses direct provider
- This is expected behavior and works fine

### VAPI Issues
- VAPI is separate and unaffected
- Check `NEXT_PUBLIC_VAPI_API_KEY` and `NEXT_PUBLIC_VAPI_WORKFLOW_ID`
- Verify VAPI workflow is configured correctly

