const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  try {
    const promptMessages = [
      { role: 'user', parts: [{ text: 'Test prompt' }] },
      { role: 'model', parts: [{ text: 'Understood.' }] },
      { role: 'user', parts: [{ text: 'Generate summary.' }] }
    ];

    console.log("Sending request to gemini-2.5-flash...");
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContentStream({ contents: promptMessages });

    for await (const chunk of response.stream) {
      process.stdout.write(chunk.text());
    }
    console.log("\nDone");
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

test();
