const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
require('dotenv').config({ path: '.env.local' });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  try {
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    const prompt = `
      You are an expert medical assistant. Analyze the provided medical document image (like a lab report, prescription, or clinical note).
      Extract the following information in strict JSON format. If a field is not applicable, return null.
      {
        "documentType": "string",
        "keyFindings": "string",
        "icd10Codes": ["string"],
        "medications": ["string"],
        "extractedText": "string"
      }
      Do not include any other text besides the JSON.
    `;

    console.log("Sending request...");
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: Buffer.from(base64Data, 'base64') }
          ]
        }
      ]
    });

    console.log("Response:", text);
  } catch (error) {
    console.error("API Error:", error);
  }
}

test();
