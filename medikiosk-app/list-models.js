const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    const json = await res.json();
    console.log(JSON.stringify(json.models.map(m => m.name), null, 2));
  } catch (error) {
    console.error(error);
  }
}

listModels();
