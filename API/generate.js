// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { birthdate, gender, wishes, style } = req.body;

  // Basic validation of the incoming payload
  const validBirthdate = typeof birthdate === 'string' && !isNaN(Date.parse(birthdate));
  const validGender = typeof gender === 'string' && ['male', 'female', 'other'].includes(gender.toLowerCase());
  const validWishes = Array.isArray(wishes) && wishes.length > 0 && wishes.every(w => typeof w === 'string' && w.trim().length > 0);
  const validStyle = typeof style === 'string' && style.trim().length > 0;

  if (!validBirthdate || !validGender || !validWishes || !validStyle) {
    return res.status(400).json({ error: 'Invalid input provided' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OpenRouter API key');
    return res.status(500).json({ error: 'Server configuration error' });
  }

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
    if (!response.ok) {
      const message = data?.error?.message || data?.message || 'OpenRouter API request failed';
      console.error('OpenRouter API error:', message);
      return res.status(response.status).json({ error: message });
    }

    const resultText = data.choices?.[0]?.message?.content;
    res.status(200).json({ result: resultText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
