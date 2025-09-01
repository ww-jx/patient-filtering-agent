import { NextResponse } from "next/server";
import { openRouterChat } from "@/lib/openRouter";

// Check if patient is eligible for trial
export async function POST(req: Request) {
  try {
    const { eligibilityCriteria, profile } = await req.json();


    const prompt = `
You are a patient eligibility evaluator. 
Given the eligibility criteria and a patient's data , respond with whether the patient is eligible.
If a patient does not have a specific condition mentioned in the criteria, assume they are eligible, and mention to get that checked beforehand.

Eligibility Criteria:
${JSON.stringify(eligibilityCriteria, null, 2)}

Patient Data:
${JSON.stringify(profile, null, 2)}


Instructions:
- Output a JSON object with keys:
  - "eligible": true or false
  - "explanation": string explaining the reasoning
- Output only JSON, no extra text.
`;

    // Structured JSON schema for OpenRouter
    const structuredOutput = {
      type: "json_object" as const,
      schema: {
        type: "object",
        properties: {
          eligible: { type: "boolean" },
          explanation: { type: "string" },
        },
        required: ["eligible", "explanation"],
        additionalProperties: false,
      },
    };

    const result = await openRouterChat(prompt, { structuredOutput });

    console.log("filterPatients result:", result);

    return NextResponse.json(result);
  } catch (err) {
    console.error("filterPatients error:", err);
    return NextResponse.json(
      { error: "Failed to filter patient" },
      { status: 500 }
    );
  }
}
