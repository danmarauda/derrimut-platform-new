import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Vercel AI Gateway Configuration
 * 
 * This module sets up AI models through Vercel AI Gateway for:
 * - Rate limiting
 * - Cost tracking
 * - Unified API
 * - Fallback handling
 * 
 * To use Vercel AI Gateway:
 * 1. Get your AI Gateway API key from Vercel dashboard
 * 2. Set AI_GATEWAY_API_KEY environment variable
 * 3. The gateway will automatically be used via providerOptions
 */

// Initialize Google Generative AI provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate text using Vercel AI Gateway (if configured) or direct provider
 */
export async function generateTextWithGateway(options: {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}) {
  const { model, prompt, temperature = 0.4, maxTokens, responseFormat } = options;

  // Use gateway if AI_GATEWAY_API_KEY is set, otherwise use direct provider
  const providerOptions = process.env.AI_GATEWAY_API_KEY
    ? {
        gateway: {
          apiKey: process.env.AI_GATEWAY_API_KEY,
        },
      }
    : undefined;

  const result = await generateText({
    model: google(model),
    prompt,
    temperature,
    // Note: maxTokens is not supported in AI SDK v5, use model configuration instead
    ...(responseFormat && { responseFormat }),
    ...(providerOptions && { providerOptions }),
  });

  return result;
}

/**
 * Generate structured JSON using Vercel AI Gateway
 */
export async function generateStructuredJSON(options: {
  model: string;
  prompt: string;
  temperature?: number;
}) {
  return generateTextWithGateway({
    ...options,
    responseFormat: { type: 'json_object' },
  });
}
