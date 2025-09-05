import {
  openRouterChat,
  uploadFile,
  processFile,
  getFileCacheStats,
  clearFileCache
} from "./openRouter";
import path from "path";

interface CtgQueryInput {
  keywords: string;
  statuses?: string[]; // e.g., ["RECRUITING", "NOT_YET_RECRUITING"]
  location?: string;   // e.g., "Boston" or "India"
}

interface CtgQueryOutput {
  queryParams: Record<string, string>;
}

interface BuildCtgQueryOptions {
  apiSpecFile?: string;          // Path to API spec file
  apiSpecBuffer?: Buffer;        // Buffer of uploaded API spec
  apiSpecFileName?: string;      // Name of uploaded API spec file
  useCache?: boolean;           // Whether to use cached API spec (default: true)
}

// Fallback minimal API info if no spec provided
function getMinimalApiInfo(): string {
  return `
ClinicalTrials.gov API Essential Parameters:

Required:
- query.term (string): other terms to search for

Optional Query:
- query.locn (string): Location search terms
- query.cond (string): Conditions or diseases to search for


This API uses Essie expression syntax for each field.

Rules:
- Use comma-separated values for arrays
- Set reasonable defaults for pagination
`;
}

export async function buildCtgQuery(
  input: CtgQueryInput,
  options: BuildCtgQueryOptions = {}
): Promise<CtgQueryOutput> {
  const { keywords, statuses, location } = input;
  const {
    apiSpecFile,
    apiSpecBuffer,
    apiSpecFileName,
    useCache = true
  } = options;

  console.log("Building CTG Query with input:", input);

  let apiInfo: string;

  try {
    if (apiSpecBuffer && apiSpecFileName) {
      // Upload and process buffer
      console.log(`Processing uploaded file: ${apiSpecFileName}`);
      apiInfo = await uploadFile(apiSpecBuffer, apiSpecFileName);
    } else if (apiSpecFile) {
      // Process file from path
      console.log(`Processing file: ${apiSpecFile}`);
      apiInfo = await processFile(apiSpecFile);
    } else {
      // Try environment variable (backward compatibility)
      const envPath = path.join(process.cwd(), "public/data/ctg/ctg-oas-v2.yaml");
      if (envPath) {
        console.log(`Processing file from env var: ${envPath}`);
        apiInfo = await processFile(envPath);
      } else {
        // Use minimal built-in API info
        console.log('Using minimal built-in API info');
        apiInfo = getMinimalApiInfo();
      }
    }
  } catch (error) {
    console.warn('Failed to process API spec file, using minimal info:', error);
    apiInfo = getMinimalApiInfo();
  }

  // Structured JSON object output
  const structuredOutput = {
    type: "json_object" as const,
    schema: {
      type: "object",
      properties: {
        "query.term": { type: "string" },
        "query.locn": { type: "string" },
        "pageSize": { type: "number" },
        "countTotal": { type: "boolean" }
      },
      required: ["query.term"],
      additionalProperties: false,
    },
  };

  const prompt = `Build ClinicalTrials.gov API query parameters.

Input:
The user is looking for ${keywords}
- Location: ${location || "none"}

API Reference:
${apiInfo}

Instructions:
1. Use query.term for other terms
2. User query.cond for conditions and diseases
3. Use query.locn for location if provided
4. Set pageSize to 10
5. Set countTotal to true
6. Only include parameters that have values
7. Ensure status values are valid from the API spec

Use Essie expression syntax for fields.

Return JSON object with parameter names as keys and their values.`;

  // Call OpenRouter
  const response = await openRouterChat(prompt, { structuredOutput });

  console.log("Generated CTG JSON:", response);

  return { queryParams: response };
}

// Convenience function for uploading API spec and building query
export async function buildCtgQueryWithUpload(
  input: CtgQueryInput,
  apiSpecBuffer: Buffer,
  apiSpecFileName: string
): Promise<CtgQueryOutput> {
  return buildCtgQuery(input, {
    apiSpecBuffer,
    apiSpecFileName
  });
}

// Convenience function for file path
export async function buildCtgQueryWithFile(
  input: CtgQueryInput,
  apiSpecFile: string
): Promise<CtgQueryOutput> {
  return buildCtgQuery(input, {
    apiSpecFile
  });
}

// Batch processing with shared API spec
export async function buildCtgQueriesBatch(
  inputs: CtgQueryInput[],
  options: BuildCtgQueryOptions = {}
): Promise<CtgQueryOutput[]> {
  const results: CtgQueryOutput[] = [];

  // Process API spec once (will be cached for subsequent calls)
  if (options.apiSpecBuffer && options.apiSpecFileName) {
    await uploadFile(options.apiSpecBuffer, options.apiSpecFileName);
  } else if (options.apiSpecFile) {
    await processFile(options.apiSpecFile);
  }

  // Build all queries (will use cached API spec)
  for (const input of inputs) {
    try {
      const result = await buildCtgQuery(input, { useCache: true });
      results.push(result);
    } catch (error) {
      console.error('Failed to build query for input:', input, error);
      // Continue with other queries
    }
  }

  return results;
}

// Utility functions
export function getCacheInfo() {
  return {
    fileCache: getFileCacheStats(),
    timestamp: new Date().toISOString()
  };
}

export function clearAllCaches() {
  clearFileCache();
  console.log('All caches cleared');
}

// Next.js App Router utility functions for handling file uploads
export async function handleApiSpecUpload(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  fileName?: string;
  extractedLength?: number;
  cacheStats?: ReturnType<typeof getCacheInfo>;
  error?: string;
}> {
  try {
    const file = formData.get('apiSpec') as File;

    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    // Validate file type
    if (!file.name.match(/\.(yaml|yml|json)$/)) {
      return { success: false, error: 'Only YAML and JSON files are allowed' };
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 10MB limit' };
    }

    console.log(`Received upload: ${file.name}, size: ${file.size} bytes`);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractedInfo = await uploadFile(buffer, file.name);

    return {
      success: true,
      message: `API spec ${file.name} processed and cached`,
      fileName: file.name,
      extractedLength: extractedInfo.length,
      cacheStats: getCacheInfo()
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function handleBuildQuery(
  formData: FormData | { keywords: string; statuses?: string[]; location?: string; }
): Promise<{
  success: boolean;
  input?: CtgQueryInput;
  queryParams?: Record<string, string>;
  cacheStats?: ReturnType<typeof getCacheInfo>;
  error?: string;
}> {
  try {
    let keywords: string;
    let statuses: string[] | undefined;
    let location: string | undefined;
    let apiSpecFile: File | null = null;

    if (formData instanceof FormData) {
      // Handle FormData from Next.js request
      keywords = formData.get('keywords') as string;
      const statusesStr = formData.get('statuses') as string;
      location = (formData.get('location') as string) || undefined;
      apiSpecFile = formData.get('apiSpec') as File;

      statuses = statusesStr ?
        (statusesStr.includes(',') ? statusesStr.split(',').map(s => s.trim()) : [statusesStr]) :
        undefined;
    } else {
      // Handle JSON object
      ({ keywords, statuses, location } = formData);
    }

    if (!keywords) {
      return { success: false, error: 'Keywords are required' };
    }

    const input: CtgQueryInput = {
      keywords,
      statuses,
      location
    };

    const options: BuildCtgQueryOptions = {};

    // If file uploaded with this request, use it
    if (apiSpecFile && apiSpecFile.size > 0) {
      if (!apiSpecFile.name.match(/\.(yaml|yml|json)$/)) {
        return { success: false, error: 'Only YAML and JSON files are allowed for API spec' };
      }

      const arrayBuffer = await apiSpecFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      options.apiSpecBuffer = buffer;
      options.apiSpecFileName = apiSpecFile.name;
    }

    const result = await buildCtgQuery(input, options);

    return {
      success: true,
      input,
      queryParams: result.queryParams,
      cacheStats: getCacheInfo()
    };
  } catch (error) {
    console.error('Query build error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export everything for backward compatibility
export { buildCtgQuery as default };

export type {
  CtgQueryInput,
  CtgQueryOutput,
  BuildCtgQueryOptions
};
