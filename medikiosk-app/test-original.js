const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  try {
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    console.log("Sending request...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("Response:", responseText);
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

test();
