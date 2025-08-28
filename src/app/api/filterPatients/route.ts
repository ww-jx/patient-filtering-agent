import { NextResponse } from "next/server";
import { geminiChat } from "@/lib/gemini";
import { Type } from "@google/genai";

// Check if patient is eligible for trial
export async function POST(req: Request) {
  try {
    const { eligibilityCriteria, filePath } = await req.json();

    const prompt = `
You are a patient eligibility evaluator. 
Given the eligibility criteria and a patient's data (XML format), respond with whether the patient is eligible.
If a patient does not have a specific condition mentioned in the criteria, assume they are eligible, and mention to get that checked beforehand.

Eligibility Criteria:
${JSON.stringify(eligibilityCriteria, null, 2)}

Use the attached XML file for patient data.
`;

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          eligible: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING },
        },
        required: ["eligible", "explanation"],
        propertyOrdering: ["eligible", "explanation"],
      },
    };

    // Pass patientData as a file
    const result = await geminiChat(prompt, "gemini-2.5-flash", {
      filePath: filePath, // full path to XML file
      mimeType: "application/xml",
      config,
    });

    console.log("filterPatients result:", result);

    const jsonResult = JSON.parse(result);

    return NextResponse.json(jsonResult);
  } catch (err) {
    console.error("filterPatients error:", err);
    return NextResponse.json({ error: "Failed to filter patient" }, { status: 500 });
  }
}
