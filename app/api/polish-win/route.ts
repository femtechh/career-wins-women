import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { polishWin } from '@/lib/openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('Polish API route called');
    const { winId, style } = await request.json();
    console.log('Request params:', { winId, style });

    if (!winId || !style) {
      return NextResponse.json(
        { error: 'Missing winId or style' },
        { status: 400 }
      );
    }

    const { data: win, error: fetchError } = await supabase
      .from('wins')
      .select('*')
      .eq('id', winId)
      .maybeSingle();

    if (fetchError || !win) {
      console.error('Win fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Win not found' },
        { status: 404 }
      );
    }

    console.log('Polishing win with style:', style);
    const polishedText = await polishWin(win.text_raw, style);
    console.log('Polish completed successfully, length:', polishedText?.length);

    if (!polishedText || typeof polishedText !== 'string') {
      throw new Error('Invalid polished text received from OpenAI');
    }

    const { error: updateError } = await supabase
      .from('wins')
      .update({
        text_polished: polishedText,
        polish_style: style
      })
      .eq('id', winId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      polishedText,
      style
    });
  } catch (error: any) {
    console.error('Error polishing win:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to polish win' },
      { status: 500 }
    );
  }
}
