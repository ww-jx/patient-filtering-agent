import { geminiChat } from './gemini';

interface EssieQueryInput {
  keywords: string;
  statuses?: string[];      // e.g., ["RECRUITING", "NOT_YET_RECRUITING"]
  location?: string;        // e.g., "Boston" or "India"
}

interface EssieQueryOutput {
  queryParams: Record<string, string>;
}

export async function buildEssieQuery(input: EssieQueryInput): Promise<EssieQueryOutput> {
  const { keywords, statuses, location } = input;

  const openApiFile = process.env.CT_OPENAPI_FILE;

  console.log('Building Essie Query with input:', input);

  // Hardcoded config for structured JSON output
  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        "query.term": { type: "string" },
        "filter.overallStatus": { type: "string" },
        "query.locn": { type: "string" },
      },
      required: ["query.term"],
      propertyOrdering: ["query.term", "filter.overallStatus", "query.locn"],
    },
  };

  // Compose prompt for the LLM
  const prompt = `
You are a ClinicalTrials.gov query builder.
- Keywords: "${keywords}"
- Statuses: "${statuses?.join(', ') || 'any'}"
- Location: "${location || 'none'}"

Instructions:
1. Use the ClinicalTrials.gov API specification to understand valid query parameters.
4. Output the result as a JSON object with keys:
   - "query.term": Essie query string
   - "filter.overallStatus": comma-separated statuses (if any)
   - "query.locn": location string (if any)
5. Output only JSON, no extra text.
`;

  // Include OpenAPI file if available
  const geminiOptions = openApiFile ? { filePath: openApiFile, mimeType: "application/x-yaml", config, } : { config };

  const response = await geminiChat(prompt, 'gemini-2.5-flash', geminiOptions);
  console.log('Generated Essie JSON:', response);

  try {
    const parsed = JSON.parse(response);
    return { queryParams: parsed };
  } catch (err) {
    console.error('Failed to parse LLM output as JSON:', err, response);
    throw new Error('LLM output was not valid JSON');
  }
}
