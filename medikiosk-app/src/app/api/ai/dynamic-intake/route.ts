import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_INTAKE || process.env.GROQ_API_KEY || '',
});

const responseSchema = z.object({
  questionTitle: z.string(),
  questionSubtitle: z.string(),
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string()
  })),
  allowMultiple: z.boolean(),
  isFinished: z.boolean(),
  redFlagDetected: z.string().nullable()
});

export async function POST(req: NextRequest) {
  try {
    const { messages, isAyushMode, lang } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Hard limit: 6 questions (12 messages). If reached, forcefully finish.
    if (messages.length >= 12) {
      return NextResponse.json({
        questionTitle: "Gathering Summary...",
        questionSubtitle: "Please wait.",
        options: [],
        allowMultiple: false,
        isFinished: true,
        redFlagDetected: null
      });
    }

    const modeInstructions = isAyushMode
      ? `You are an AYUSH Ayurvedic Triage Assistant. You must ask questions related to:
         1. Chief Complaint
         2. Agni (Digestive Fire) and Ahara (Diet)
         3. Prakriti (Constitution) and Koshtha (Bowel Habit)
         4. Past & Family History
         5. Nidra (Sleep) & Vihara (Lifestyle)`
      : `You are an Allopathic Medical Triage Assistant. You must ask questions related to:
         1. Chief Complaint
         2. HPI (Duration, Character, Radiation, Associations, Severity - SOCRATES)
         3. Past Medical History
         4. Medications & Allergies
         5. Personal & Family History
         6. Review of Systems`;

    const langInstructions = lang === 'hi'
      ? `CRITICAL: You MUST translate 'questionTitle', 'questionSubtitle', and the option 'label's into fluent Hindi (Devanagari script). Keep the 'id' and 'icon' in English.`
      : `Output all text in English.`;

    const systemPrompt = `
      ${modeInstructions}

      Your goal is to dynamically generate the next best question to ask the patient based on their previous answers.
      Each question should logically flow from the previous ones.

      CRITICAL RULE: DO NOT ask a question that has already been asked in the conversation history!
      Always advance to the NEXT logical topic based on the triage protocol.
      For example, if you already know the chief complaint, ask about its duration or character. If you know the HPI, move to past medical history.

      Provide 2 to 6 multiple-choice options for the user to quickly select from.
      Use STRICTLY lowercase valid Google Material Symbol names for the 'icon' field (e.g., 'sick', 'favorite', 'healing', 'medication', 'warning', 'schedule'). DO NOT invent uppercase names like THROAT_SORE or HEADACHE. Only lowercase strings and underscores!

      If you have gathered enough information across all the required topics mentioned above, set 'isFinished' to true.
      If the conversation history contains 10 or more messages (5 questions), you MUST set 'isFinished' to true.
      If the user mentions an emergency symptom, set 'redFlagDetected' to a warning message. Otherwise, leave it null.

      ${langInstructions}

      You must return ONLY a valid JSON object matching this schema:
      {
        "questionTitle": "string",
        "questionSubtitle": "string",
        "options": [{ "id": "string", "label": "string", "icon": "string" }],
        "allowMultiple": boolean,
        "isFinished": boolean,
        "redFlagDetected": "string" | null
      }
    `;

    // Format messages for the Groq SDK (assistant/user roles)
    const formattedMessages: { role: 'user' | 'assistant'; content: string }[] = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    formattedMessages.push({
      role: 'user',
      content: 'Generate the next JSON state based on the conversation so far.'
    });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' },
      reasoning_format: 'hidden',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages
      ]
    } as any);

    const raw = completion.choices[0]?.message?.content || '{}';
    const object = responseSchema.parse(JSON.parse(raw));

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Error in dynamic-intake route:', error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'High demand right now — please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
