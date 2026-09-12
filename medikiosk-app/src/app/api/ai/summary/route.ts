import { StreamingTextResponse, OpenAIStream } from 'ai';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getDoctorSessionCookie } from '@/lib/doctorSession';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_SUMMARY || process.env.GROQ_API_KEY || 'placeholder-key',
});

export async function POST(req: NextRequest) {
  const doctorSession = await getDoctorSessionCookie();
  if (!doctorSession) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { chatHistory, documents, lang } = await req.json();

  const languageInstruction = lang === 'hi'
    ? `Write all narrative prose in fluent Hindi (Devanagari script). Keep section headings' standard medical abbreviations (CC, HPI, ROS) as-is, but translate their descriptive labels and all body text into Hindi.`
    : `Write the entire note in English.`;

  const systemPrompt = `You are an expert clinical summarizer.
You will be provided with the raw chat history of a patient's triage intake and the data extracted from their scanned medical documents.
Your task is to generate a professional, concise clinical "History and Physical" (H&P) or SOAP note for the doctor.

Use standard medical formatting and terminology:
- Chief Complaint (CC)
- History of Present Illness (HPI)
- Review of Systems (ROS) (if applicable from the chat)
- Relevant Past Medical History (from documents or chat)
- Document / Lab Findings
- AI Inferred Assessment / Triage Acuity (e.g., Routine, Urgent, Emergent)

${languageInstruction}

Return the output formatted in clean Markdown.`;

  const promptMessage = `Please generate a clinical summary based on the following data:

      ## Patient Triage Chat Transcript:
      ${JSON.stringify(chatHistory, null, 2)}

      ## Scanned Document Data:
      ${JSON.stringify(documents, null, 2)}
      `;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptMessage },
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
