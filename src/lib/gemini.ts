import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GeminiChatOptions {
  filePath?: string; // optional file to upload
  mimeType?: string;
  config?: any;
}

export async function geminiChat(
  prompt: string,
  model: string,
  options?: GeminiChatOptions
) {
  let finalPrompt = prompt;

  // if a filePath is provided, upload and include file contents in prompt
  if (options?.filePath) {
    const absPath = path.resolve(options.filePath);
    const fileContents = fs.readFileSync(absPath, "utf-8");

    // optionally upload to the API if needed
    const uploadedFile = await ai.files.upload({
      file: absPath,
      config: {
        mimeType: options.mimeType,
      },
    });
    console.log("Uploaded file:", uploadedFile.name);

    // include the file contents in the prompt
    finalPrompt = `File Contents:\n${fileContents}\n\nPrompt:\n${prompt}`;
  }

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    ...(options?.config ? { config: options.config } : {}),
  });

  return response.text;
}
