// pages/api/generate-image.js 或 api/generate-image.js（Vercel 自动识别）
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.DEEPAI_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `text=${encodeURIComponent(prompt)}`,
    });

    const data = await response.json();

    if (data.output_url) {
      res.status(200).json({ imageUrl: data.output_url });
    } else {
      res.status(500).json({ error: 'Image generation failed', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
