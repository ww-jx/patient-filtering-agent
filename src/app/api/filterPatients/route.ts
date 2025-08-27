import { NextResponse } from "next/server";
import { geminiChat } from "@/app/lib/gemini";
import { Type } from "@google/genai";

//check if patient is eligible for trial
export async function POST(req: Request) {
  try {
    const { eligibilityCriteria, patientData } = await req.json();

    const prompt = `
You are a patient eligibility evaluator. 
Given the eligibility criteria and a patient's data (XML format), respond with whether the patient is eligible.

Eligibility Criteria:
${JSON.stringify(eligibilityCriteria, null, 2)}

Patient Data (XML):
${patientData}
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

    const result = await geminiChat(prompt, "gemini-2.5-flash", config);
    console.log("filterPatients result:", result);

    const jsonResult = JSON.parse(result);

    return NextResponse.json(jsonResult);
  } catch (err) {
    console.error("filterPatients error:", err);
    return NextResponse.json({ error: "Failed to filter patient" }, { status: 500 });
  }
}
