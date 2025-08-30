import { openRouterChat } from "./openRouter";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface CtgQueryInput {
  keywords: string;
  statuses?: string[]; // e.g., ["RECRUITING", "NOT_YET_RECRUITING"]
  location?: string;   // e.g., "Boston" or "India"
}

interface CtgQueryOutput {
  queryParams: Record<string, string>;
}

export async function buildCtgQuery(input: CtgQueryInput): Promise<CtgQueryOutput> {
  const { keywords, statuses, location } = input;

  // Load OpenAPI spec as string (YAML or JSON)
  let openApiContent = "";
  const openApiFilePath = process.env.CT_OPENAPI_FILE;
  if (openApiFilePath) {
    const absPath = path.resolve(openApiFilePath);
    const rawContent = fs.readFileSync(absPath, "utf-8");
    if (openApiFilePath.endsWith(".yaml") || openApiFilePath.endsWith(".yml")) {
      const parsed = yaml.load(rawContent);
      openApiContent = JSON.stringify(parsed, null, 2);
    } else {
      openApiContent = rawContent;
    }
  }

  console.log("Building CTG Query with input:", input);

  // Structured JSON object output
  const structuredOutput = {
    type: "json_object" as const,
    schema: {
      type: "object",
      properties: {
        "query.term": { type: "string" },
        "filter.overallStatus": { type: "string" },
        "query.locn": { type: "string" },
      },
      required: ["query.term"],
      additionalProperties: false,
    },
  };

  const prompt = `
You are a ClinicalTrials.gov query builder.
- Keywords: "${keywords}"
- Statuses: "${statuses?.join(", ") || "any"}"
- Location: "${location || "none"}"

API Specification:
\`\`\`
${openApiContent}
\`\`\`

Instructions:
1. Use the API specification above to understand valid query parameters.
2. Output a JSON object with keys:
   - "query.term": Essie query string
   - "filter.overallStatus": comma-separated statuses (if any)
   - "query.locn": location string (if any)
3. Output only JSON, no extra text.
`;

  // Call OpenRouter
  const response = await openRouterChat(prompt, { structuredOutput });

  console.log("Generated CTG JSON:", response);

  return { queryParams: response };
}
