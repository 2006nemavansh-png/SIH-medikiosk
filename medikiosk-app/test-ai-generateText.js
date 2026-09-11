const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
require('dotenv').config({ path: '.env.local' });

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  try {
    const base64Data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    console.log("Sending request...");
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: 'You are an expert medical assistant.',
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

    console.log("Response:", text);
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

test();
