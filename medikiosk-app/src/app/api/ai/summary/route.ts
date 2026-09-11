import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

export async function POST(req: NextRequest) {
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

  const promptMessages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
    { role: 'user', parts: [{ text: promptMessage }] }
  ];

  const response = await genAI
    .getGenerativeModel({ model: 'gemini-2.5-flash' }) // Use flash since pro lacks free tier quota
    .generateContentStream({ contents: promptMessages });

  const stream = GoogleGenerativeAIStream(response);
  return new StreamingTextResponse(stream);
}
