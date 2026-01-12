import { NextRequest, NextResponse } from 'next/server';
import { generateExportSummary } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { wins, format } = await request.json();

    if (!wins || !Array.isArray(wins) || wins.length === 0) {
      return NextResponse.json(
        { error: 'No wins provided' },
        { status: 400 }
      );
    }

    if (!format || !['resume', 'review'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }

    const text = await generateExportSummary(wins, format);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate export' },
      { status: 500 }
    );
  }
}
