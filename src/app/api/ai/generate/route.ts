import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Vercel AI Gateway API Route
 * 
 * This route provides a unified interface for AI model requests
 * through Vercel AI Gateway for rate limiting, cost tracking, and monitoring.
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.4, responseFormat } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

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
      ...(responseFormat && { responseFormat }),
      ...(providerOptions && { providerOptions }),
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    });

  } catch (error) {
    console.error('AI Gateway error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to generate text',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

