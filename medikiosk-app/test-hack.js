const { generateObject } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');

async function test() {
  try {
    const model = google('gemini-2.5-flash');
    model.defaultObjectGenerationMode = 'json';
    
    const { object } = await generateObject({
      model,
      schema: z.object({ msg: z.string() }),
      prompt: "say hello"
    });
    console.log(object);
  } catch(e) {
    console.log(e.message);
  }
}
test();
