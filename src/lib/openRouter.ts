import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL;

interface StructuredOutput {
  type: "json_object"; // only json_object supported here
  schema: any;
}

interface OpenRouterChatOptions {
  structuredOutput?: StructuredOutput;
}


function stripCodeFences(text: string) {
  return text.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
}

export async function openRouterChat(
  prompt: string,
  options?: OpenRouterChatOptions
) {
  const contents: any[] = [{ type: "text", text: prompt }];


  const messages: any[] = [
    { role: "system", content: [{ type: "text", text: "You are a helpful assistant." }] },
    { role: "user", content: contents },
  ];

  const body: any = { model: DEFAULT_MODEL, messages };

  if (options?.structuredOutput) {
    body.response_format = options.structuredOutput;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned no content");
  }

  // Parse structured JSON output safely
  if (options?.structuredOutput) {
    try {
      return JSON.parse(stripCodeFences(content));
    } catch (err) {
      console.error("Failed to parse OpenRouter structured output:", content);
      throw err;
    }
  }

  return content;
}
