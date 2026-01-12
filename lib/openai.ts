async function makeOpenAIRequest(apiKey: string, payload: any, timeoutMs: number = 45000): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      console.log('Making OpenAI API request...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'WinTracker/1.0',
        },
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        reject(new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`));
        return;
      }

      const data = await response.json();
      console.log('OpenAI response received successfully');
      resolve(data);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
        code: error.code,
      });
      reject(error);
    }
  });
}

export async function polishWin(textRaw: string, style: 'resume' | 'review' | 'linkedin'): Promise<string> {
  const prompts = {
    resume: `You are a career coach helping women articulate achievements confidently.
Rewrite the following work note into a strong, concise resume bullet point (1-2 lines max).
Use action verbs. If impact is missing, suggest a reasonable metric without exaggeration.
Format with bullet point style but don't include the bullet symbol.

Note: ${textRaw}`,

    review: `You are a career coach helping women articulate achievements confidently.
Rewrite the following work note into a performance review statement that highlights impact and growth.
Be specific and confident. If metrics aren't provided, suggest reasonable ones.

Note: ${textRaw}`,

    linkedin: `You are a career coach helping women articulate achievements confidently.
Rewrite the following work note into an engaging LinkedIn post style achievement.
Make it professional yet approachable. Include relevant context.

Note: ${textRaw}`
  };

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key is missing');
    throw new Error('OpenAI API key is not configured');
  }

  console.log('API Key configured:', !!apiKey, 'Length:', apiKey.length);
  console.log('Polishing with style:', style);

  try {
    const data = await makeOpenAIRequest(apiKey, {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive career coach who helps professionals articulate their achievements with confidence and clarity.'
        },
        {
          role: 'user',
          content: prompts[style]
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(data));
      throw new Error('Invalid response from OpenAI API');
    }

    const polishedText = data.choices[0].message.content?.trim();

    if (!polishedText) {
      throw new Error('Empty response from OpenAI API');
    }

    return polishedText;
  } catch (error: any) {
    console.error('Error in polishWin:', error);

    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. Please try again.');
    }

    if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Unable to reach OpenAI API. Please check your network connection.');
    }

    if (error.message.includes('fetch failed')) {
      throw new Error('Network request failed. This may be due to network issues or firewall restrictions.');
    }

    throw error;
  }
}

export async function generateExportSummary(wins: Array<{ text_raw: string; text_polished: string | null; win_date: string }>, format: 'resume' | 'review'): Promise<string> {
  const winsText = wins.map((w, i) =>
    `${i + 1}. ${w.text_polished || w.text_raw} (${w.win_date})`
  ).join('\n');

  const prompts = {
    resume: `You are a career coach helping compile achievements into resume bullets.
Transform these career wins into 5-7 polished resume bullet points.
Use strong action verbs, quantify impact where possible, and prioritize the most impressive achievements.
Format each as a standalone bullet (without the bullet symbol).

Career wins:
${winsText}`,

    review: `You are a career coach helping compile achievements into a performance review summary.
Transform these career wins into a cohesive performance review narrative.
Highlight key themes, growth, and impact. Use confident language.
Structure: Opening summary (2-3 sentences), then key achievements organized by theme.

Career wins:
${winsText}`
  };

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive career coach who helps professionals compile and present their achievements effectively.'
          },
          {
            role: 'user',
            content: prompts[format]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw error;
  }
}
