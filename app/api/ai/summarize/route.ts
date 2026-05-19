import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following mathematical notes into key concepts and formulas. Use LaTeX for math: \n\n${text}`,
    });

    return NextResponse.json({ summary: response.text });
  } catch (error) {
    console.error("Summarize Error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
