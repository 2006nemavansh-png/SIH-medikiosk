import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_DOCUMENTS || process.env.GROQ_API_KEY || 'placeholder-key',
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // imageBase64 is already a data URI (e.g. data:image/jpeg;base64,...).
    // Note: Groq's vision model expects an actual image, not a PDF — PDF
    // uploads are not supported through this path.
    const prompt = `
      You are an expert medical assistant. Analyze the provided medical document image (like a lab report, prescription, or clinical note).
      Extract the following information in strict JSON format. If a field is not applicable, return null.
      {
        "documentType": "string (e.g. Lab Report, Prescription, Discharge Summary)",
        "keyFindings": "string (a brief summary of the most important values or findings)",
        "icd10Codes": ["string (inferred ICD-10 codes based on the diagnoses mentioned)"],
        "medications": ["string (standardized generic names of medications mentioned)"],
        "extractedText": "string (the raw text extracted from the document)"
      }
      Do not include any other text besides the JSON.
    `;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON output from the model
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let parsedData = null;

    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from Groq:', e);
      }
    }

    if (!parsedData) {
      return NextResponse.json({ error: 'Failed to extract structured data' }, { status: 500 });
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in parse-document route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
