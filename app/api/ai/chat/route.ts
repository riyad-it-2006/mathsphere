import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { message, context, image } = await req.json();
    
    const contents: any[] = [];
    const parts: any[] = [];

    if (message) {
      parts.push({ text: `Context about user: ${JSON.stringify(context)}. User message: ${message}` });
    }

    if (image) {
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
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: "You are an expert mathematician and academic advisor for students at Govt. Bhola College. You provide clear, encouraging assistance with math problems (using LaTeX where appropriate) and campus-related queries. If an image is provided, analyze the math problem in the image and solve it step-by-step."
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
