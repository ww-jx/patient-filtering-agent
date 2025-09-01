import OpenAI from "openai";
import { observeOpenAI } from "langfuse";

const openai = observeOpenAI(new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
}));

export interface StructuredOutput {
  type: "json_object";
  schema: Record<string, unknown>;
}

export interface OpenRouterChatOptions {
  structuredOutput?: StructuredOutput;
}

function stripCodeFences(text: string) {
  return text.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
}

export async function openRouterChat(
  prompt: string,
  options?: OpenRouterChatOptions
) {
  const response = await openai.chat.completions.create({
    model: process.env.OPENROUTER_MODEL,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    response_format: options?.structuredOutput,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned no content");

  if (options?.structuredOutput) {
    try {
      return JSON.parse(stripCodeFences(content));
    } catch (err) {
      console.error("Failed to parse structured output:", content);
      throw err;
    }
  }

  return content;
}
