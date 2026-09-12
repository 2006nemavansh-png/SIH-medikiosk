import { StreamingTextResponse, OpenAIStream } from 'ai';
import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'placeholder-key',
});

export async function POST(req: NextRequest) {
  const { messages, language, isAyushMode } = await req.json();

  const systemPrompt = `You are a triage nurse at an Indian hospital (MediKiosk).
You are speaking to a patient who just walked in.
Your goal is to gather their chief complaint, understand their symptoms, and identify any red flags (e.g. chest pain, severe breathlessness) that require immediate emergency attention.
Keep your responses short, conversational, and focused on asking 1 follow up question at a time to narrow down the issue.
IMPORTANT: You MUST respond in ${language === 'hi' ? 'Hindi (Devanagari script)' : language === 'pa' ? 'Punjabi (Gurmukhi script)' : language === 'ta' ? 'Tamil script' : 'English'}.
${isAyushMode ? 'The patient has selected AYUSH (Ayurvedic/Homeopathic) mode, so ask about lifestyle, doshas, or holistic symptoms if relevant.' : ''}
`;

  const promptMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    })),
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: promptMessages,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
