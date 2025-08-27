import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function geminiChat(
  prompt: string,
  model: string,
  config?: any
) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    ...(config ? { config } : {}),
  });

  return response.text;
}
