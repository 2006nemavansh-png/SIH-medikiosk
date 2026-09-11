async function test() {
  const res = await fetch("http://localhost:3005/api/ai/dynamic-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "assistant", content: "What seems to be the problem today?" },
        { role: "user", content: "Chest Pain" }
      ],
      isAyushMode: false,
      lang: "en"
    })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

test();
