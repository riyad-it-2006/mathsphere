import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Assistant Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, image } = req.body;
      const model = "gemini-3.5-flash";
      
      const contents: any[] = [];
      const parts: any[] = [];

      if (message) {
        parts.push({ text: `Context about user: ${JSON.stringify(context)}. User message: ${message}` });
      }

      if (image) {
        // Base64 image handling
        const base64Data = image.split(",")[1];
        const mimeType = image.split(";")[0].split(":")[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      contents.push({ role: "user", parts });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: "You are an expert mathematician and academic advisor for students at Govt. Bhola College. You provide clear, encouraging assistance with math problems (using LaTeX where appropriate) and campus-related queries. If an image is provided, analyze the math problem in the image and solve it step-by-step."
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to fetch AI response" });
    }
  });

  // Note Summarizer Endpoint
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Summarize the following mathematical notes into key concepts and formulas. Use LaTeX for math: \n\n${text}`,
      });
      res.json({ summary: response.text });
    } catch (error) {
      res.status(500).json({ error: "Failed to summarize" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
