export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { birthdate, gender, wishes, style } = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OpenRouter API key');
    return res.status(500).json({ error: 'Missing API key' });
  }

  const prompt = `
You are a mystical amulet designer. Given the user's info below, generate a mystical description and an image prompt in this format only:

JSON.stringify({
  "description": "string of poetic explanation",
  "imagePrompt": "image generation prompt based on wishes and style"
})

No extra text. No explanation. Just output the stringified JSON object.

User Info:
- Birthdate: ${birthdate}
- Gender: ${gender}
- Wishes: ${wishes.join(', ')}
- Style: ${style}
  `.trim();

  try {
    // GPT: 获取描述和图像 prompt
    const gptRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const gptData = await gptRes.json();
    const reply = gptData.choices?.[0]?.message?.content || '';

    // 正则提取 JSON.stringify({...})
    const match = reply.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Failed to extract JSON from GPT reply.');

    const parsed = JSON.parse(match[0]);
    const { description, imagePrompt } = parsed;

    if (!imagePrompt || !description) {
      throw new Error('Missing fields in GPT result');
    }

    // 图像生成
    const imageRes = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        n: 1
      })
    });

    const imageData = await imageRes.json();
    const imageUrl = imageData?.data?.[0]?.url;
    if (!imageUrl) throw new Error('Image generation failed.');

    return res.status(200).json({ description, imageUrl });

  } catch (err) {
    console.error('Amulet generation error:', err);
    return res.status(500).json({ error: 'Failed to generate amulet' });
  }
}
