import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_INTAKE || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash", systemInstruction: systemPrompt });

    // Format messages for gemini SDK
    // Assistant uses 'model', User uses 'user'
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    // Add a final prompt to force the response
    formattedMessages.push({
      role: 'user',
      parts: [{ text: 'Generate the next JSON state based on the conversation so far.' }]
    });

    const result = await model.generateContent({
      contents: formattedMessages,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text();
    let jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : text;
    const object = JSON.parse(jsonString);

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Error in dynamic-intake route:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
