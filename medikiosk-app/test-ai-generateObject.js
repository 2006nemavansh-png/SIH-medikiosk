const { generateObject } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { z } = require('zod');
require('dotenv').config({ path: '.env.local' });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  try {
    const base64Data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    console.log("Sending request...");
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      mode: 'json',
      system: 'You are an expert medical assistant.',
      schema: z.object({
        documentType: z.string(),
        keyFindings: z.string(),
        icd10Codes: z.array(z.string()),
        medications: z.array(z.string()),
        extractedText: z.string(),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract information from this medical document.' },
            { type: 'image', image: base64Data }
          ]
        }
      ]
    });

    console.log("Response:", object);
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

test();
