import OpenAI from "openai";
import { observeOpenAI } from "langfuse";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import yaml from "js-yaml";

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

interface ProcessedFile {
  hash: string;
  extractedInfo: string;
  timestamp: number;
  fileName: string;
}

// File processing cache
class FileCache {
  private cache = new Map<string, ProcessedFile>();
  private cacheFile = path.join(process.cwd(), '.file-cache.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as ProcessedFile);
        });
        console.log(`Loaded ${this.cache.size} cached files`);
      }
    } catch (error) {
      console.warn('Failed to load file cache:', error);
    }
  }

  private saveToDisk(): void {
    try {
      const data = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save file cache:', error);
    }
  }

  get(key: string): ProcessedFile | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: ProcessedFile): void {
    this.cache.set(key, value);
    this.saveToDisk();
  }

  clear(): void {
    this.cache.clear();
    if (fs.existsSync(this.cacheFile)) {
      fs.unlinkSync(this.cacheFile);
    }
  }

  stats() {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalSizeBytes: JSON.stringify(Object.fromEntries(this.cache)).length
    };
  }
}

const fileCache = new FileCache();

function stripCodeFences(text: string) {
  return text.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
}

// Process and extract key information from uploaded files
async function processUploadedFile(filePath: string, fileName: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Calculate file hash for caching
  const fileHash = crypto
    .createHash('md5')
    .update(fs.readFileSync(filePath))
    .digest('hex');

  const cacheKey = `file_${fileHash}`;
  const cached = fileCache.get(cacheKey);

  if (cached) {
    console.log(`Using cached processed file: ${cached.fileName}`);
    return cached.extractedInfo;
  }

  console.log(`Processing new file: ${fileName}`);

  // Read and parse file
  const rawContent = fs.readFileSync(filePath, "utf-8");
  let parsedContent: string;

  try {
    if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
      const yamlData = yaml.load(rawContent);
      parsedContent = JSON.stringify(yamlData, null, 2);
    } else if (fileName.endsWith('.json')) {
      // Validate JSON
      JSON.parse(rawContent);
      parsedContent = rawContent;
    } else {
      // For other file types, use raw content
      parsedContent = rawContent;
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Extract essential information using LLM
  const extractedInfo = await extractFileInfo(parsedContent, fileName);

  // Cache the result
  fileCache.set(cacheKey, {
    hash: fileHash,
    extractedInfo,
    timestamp: Date.now(),
    fileName
  });

  return extractedInfo;
}

async function extractFileInfo(fileContent: string, fileName: string): Promise<string> {
  const prompt = `Extract essential information from this ${fileName} file for building API queries.

Focus on:
- Parameter names and types
- Required vs optional fields
- Valid values/enums
- Format examples
- Default values
- Key constraints

Make it concise (under 1000 tokens). Remove verbose descriptions.

File Content (truncated if needed):
${fileContent.substring(0, 8000)}

Return a concise reference guide:`;

  try {
    const result = await openRouterChat(prompt);
    console.log(`Extracted info from ${fileName}: ${result.length} characters`);
    return result;
  } catch (error) {
    console.error('Failed to extract file info:', error);
    throw new Error(`Failed to process ${fileName} with LLM`);
  }
}

// Upload file from buffer
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(process.cwd(), 'temp');
    const tempPath = path.join(tempDir, fileName);

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFile(tempPath, buffer, async (err) => {
      if (err) {
        reject(new Error(`Failed to save uploaded file: ${err.message}`));
        return;
      }

      try {
        const result = await processUploadedFile(tempPath, fileName);
        // Clean up temp file
        fs.unlinkSync(tempPath);
        resolve(result);
      } catch (error) {
        // Clean up temp file on error
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        reject(error);
      }
    });
  });
}

// Process file from file path
export async function processFile(filePath: string, fileName?: string): Promise<string> {
  const actualFileName = fileName || path.basename(filePath);
  return processUploadedFile(filePath, actualFileName);
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

// Utility functions for file cache management
export function getFileCacheStats() {
  return fileCache.stats();
}

export function clearFileCache() {
  fileCache.clear();
  console.log('File cache cleared');
}

// Clean up old cache entries
export function cleanupOldFileCache(maxAgeHours: number = 24): void {
  const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

  for (const [key, value] of fileCache.cache) {
    if (value.timestamp < cutoffTime) {
      fileCache.cache.delete(key);
      console.log(`Removed old cache entry: ${key}`);
    }
  }

  fileCache.saveToDisk();
}
