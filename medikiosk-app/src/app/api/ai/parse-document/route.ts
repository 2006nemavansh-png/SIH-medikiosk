import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_DOCUMENTS || process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract the mime type dynamically (e.g., image/jpeg, image/png, or application/pdf)
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+|application\/pdf);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Clean up the base64 string
    const base64Data = imageBase64.replace(/^data:(image\/[a-zA-Z]+|application\/pdf);base64,/, '');

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Try to parse the JSON output from the model
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let parsedData = null;

    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini:', e);
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
