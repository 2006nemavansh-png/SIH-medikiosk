import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
You will receive a JSON value (string, array, or object) containing short UI text or medical phrases.
Translate every string value into ${targetLabel}, preserving meaning, tone, and medical accuracy.
Do NOT translate object keys, ids, icon names, or enum-like machine values (e.g. fields named 'id' or 'icon').
Return ONLY a JSON value with the exact same shape as the input, with human-readable string values translated.`;

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY_INTAKE || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
    );
    // Use a lighter/faster model here since this is a short, low-latency UI translation, not reasoning.
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite', systemInstruction: systemPrompt });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Translate this JSON value:\n${JSON.stringify(data)}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    const translated = JSON.parse(jsonString);

    return NextResponse.json({ data: translated });
  } catch (error: any) {
    console.error('Error in translate route:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
