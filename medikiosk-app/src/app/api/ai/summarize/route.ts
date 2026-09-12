import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    const systemPrompt = `You are an expert clinical summarizer.
Please read the following intake conversation between a triage AI and a patient.
Your task is to generate a concise, professional clinical summary (HPI) of the patient's symptoms based ONLY on the provided conversation.
Include details such as:
- Chief complaint
- Duration, severity, characteristics, radiation, aggravating/relieving factors
- Any other reported symptoms
- Any red flags identified

Output ONLY the clinical summary text in ${language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : language === 'ta' ? 'Tamil' : 'English'}. Do not include any conversational filler.`;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY_SUMMARY || process.env.GROQ_API_KEY || '',
    });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      reasoning_format: 'hidden',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: any) => m.role === 'user' || m.role === 'assistant'),
      ],
    } as any);

    const text = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
