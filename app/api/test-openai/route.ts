import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Test OpenAI endpoint called');

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API key not configured',
      env: {
        hasKey: false,
      }
    });
  }

  console.log('API Key present, length:', apiKey.length);
  console.log('API Key prefix:', apiKey.substring(0, 10));

  try {
    console.log('Testing OpenAI API connection...');

    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;
    console.log('Request completed in', duration, 'ms');
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);

      return NextResponse.json({
        success: false,
        error: `API returned ${response.status}`,
        details: errorText,
        duration,
        env: {
          hasKey: true,
          keyLength: apiKey.length,
          keyPrefix: apiKey.substring(0, 10),
        }
      });
    }

    const data = await response.json();
    console.log('API test successful, models found:', data.data?.length);

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is reachable',
      modelsCount: data.data?.length || 0,
      duration,
      env: {
        hasKey: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10),
      }
    });
  } catch (error: any) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      code: error.code,
      stack: error.stack,
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      errorCause: error.cause ? JSON.stringify(error.cause) : null,
      env: {
        hasKey: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10),
      }
    });
  }
}
