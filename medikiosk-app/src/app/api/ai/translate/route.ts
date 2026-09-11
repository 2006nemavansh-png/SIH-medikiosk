import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_INTAKE || process.env.GROQ_API_KEY || 'placeholder-key',
});

export async function POST(req: NextRequest) {
  try {
    const { data, targetLang } = await req.json();

    if (data === undefined || data === null) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Nothing to translate into English source language for this app.
    if (targetLang !== 'hi' && targetLang !== 'en') {
      return NextResponse.json({ error: 'Unsupported targetLang' }, { status: 400 });
    }

    const targetLabel = targetLang === 'hi' ? 'Hindi (Devanagari script)' : 'English';

    const systemPrompt = `You are a precise UI translation engine for a medical kiosk app.
You will receive a JSON object of the form {"value": <string, array, or object>} containing short UI text or medical phrases inside "value".
Translate every string inside "value" into ${targetLabel}, preserving meaning, tone, and medical accuracy.
Do NOT translate object keys, ids, icon names, or enum-like machine values (e.g. fields named 'id' or 'icon').
Respond with ONLY a JSON object of the exact same shape {"value": <translated>}, where "value" keeps the original shape with human-readable strings translated.`;

    // Small, fast model here since this is short, low-latency UI translation, not reasoning.
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ value: data }) },
      ],
    });

    const text = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json({ data: parsed.value });
  } catch (error: any) {
    console.error('Error in translate route:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
