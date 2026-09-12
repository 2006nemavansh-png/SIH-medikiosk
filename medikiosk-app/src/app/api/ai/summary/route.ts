import { StreamingTextResponse, OpenAIStream } from 'ai';
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_SUMMARY || process.env.GROQ_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { chatHistory, documents } = await req.json();

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

Return the output formatted in clean Markdown.`;

    const promptMessage = `Please generate a clinical summary based on the following data:

      ## Patient Triage Chat Transcript:
      ${JSON.stringify(chatHistory, null, 2)}

      ## Scanned Document Data:
      ${JSON.stringify(documents, null, 2)}
      `;

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptMessage },
      ],
      stream: true,
      reasoning_format: 'hidden',
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Error in summary route:', error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'High demand right now — please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
