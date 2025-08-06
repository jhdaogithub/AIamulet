// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { birthdate, gender, wishes, style } = req.body;

  const prompt = `Create a symbolic amulet description for someone born on ${birthdate}, gender: ${gender}, who wishes for ${wishes.join(', ')}. Style: ${style}. Return in poetic and mystical language.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    res.status(200).json({ result: resultText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
