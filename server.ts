import express from 'express';
import {GoogleGenAI, Type} from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({limit: '10mb'}));

// Vite integration for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
}

const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to generate ad copy and image prompt
app.post('/api/generate-copy', async (req, res) => {
  try {
    const {description, url} = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate professional banner ad content for the following product:
Description: ${description}
URL: ${url}

Provide:
1. A catchy headline (max 40 chars)
2. A compelling subheadline (max 80 chars)
3. A clear call to action (max 20 chars)
4. A highly descriptive prompt for an image generation model that captures the essence of this product. The prompt should be artistic, high-quality, and suitable for a background or focal point of a banner ad. Do not include text in the image prompt.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {type: Type.STRING},
            subheadline: {type: Type.STRING},
            cta: {type: Type.STRING},
            imagePrompt: {type: Type.STRING},
          },
          required: ['headline', 'subheadline', 'cta', 'imagePrompt'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error generating copy:', error);
    res.status(500).json({error: error.message});
  }
});

// Endpoint to generate the image
app.post('/api/generate-image', async (req, res) => {
  try {
    const {prompt, aspectRatio, imageSize} = req.body;

    // Mapping requested aspect ratios to supported ones if necessary
    // But we'll try to pass the user's requested one first.
    // The skill says: "1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{text: prompt}],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize, // 1K, 2K, 4K
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('No image was generated');
    }

    res.json({imageUrl});
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({error: error.message});
  }
});

// Serve static files from the Vite build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, Vite handles the frontend
  // This is a placeholder since Vite dev server usually runs separately
  // but AI Studio uses a specific setup.
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
