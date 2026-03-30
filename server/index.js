import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}` }
          },
          {
            type: 'text',
            text: `You are a fashion stylist. Analyze this clothing item and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "item": {
    "type": "descriptive name of the item",
    "colors": ["color1", "color2"],
    "style": "style category",
    "season": "best season"
  },
  "outfits": [
    {
      "title": "outfit name",
      "description": "2-3 sentence description of the complete look",
      "pieces": ["item1", "item2", "item3"],
      "occasion": "casual/date night/work/weekend/party/beach",
      "mood": "mood descriptor",
      "colorPalette": ["#hex1", "#hex2", "#hex3"]
    }
  ],
  "styleNotes": ["tip1", "tip2", "tip3"]
}
Create 6 different outfit suggestions covering different occasions and moods.`
          }
        ]
      }]
    });

    const text = message.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
