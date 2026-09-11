import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  const { messages, language, isAyushMode } = await req.json();

  const systemPrompt = `You are a triage nurse at an Indian hospital (MediKiosk). 
You are speaking to a patient who just walked in.
Your goal is to gather their chief complaint, understand their symptoms, and identify any red flags (e.g. chest pain, severe breathlessness) that require immediate emergency attention.
Keep your responses short, conversational, and focused on asking 1 follow up question at a time to narrow down the issue.
IMPORTANT: You MUST respond in ${language === 'hi' ? 'Hindi (Devanagari script)' : language === 'pa' ? 'Punjabi (Gurmukhi script)' : language === 'ta' ? 'Tamil script' : 'English'}.
${isAyushMode ? 'The patient has selected AYUSH (Ayurvedic/Homeopathic) mode, so ask about lifestyle, doshas, or holistic symptoms if relevant.' : ''}
`;

  // Prepend system prompt to messages for Gemini
  const promptMessages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
    ...messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))
  ];

  const response = await genAI
    .getGenerativeModel({ model: 'gemini-3.6-flash' })
    .generateContentStream({ contents: promptMessages });

  const stream = GoogleGenerativeAIStream(response);
  return new StreamingTextResponse(stream);
}
