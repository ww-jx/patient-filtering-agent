import { NextResponse } from "next/server";
import { openRouterChat } from "@/lib/openRouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trialDetails } = body;

    if (!trialDetails) {
      return NextResponse.json(
        { result: "Missing trialDetails in request body" },
        { status: 400 }
      );
    }

    const prompt = `
Summarize the following clinical trial details into a concise summary, and make it easy to understand for a general audience (ELI5). Highlight any key aspects or information.

${trialDetails}

Only return the summary without any additional commentary or explanation.
Return in markfown format.
`;

    const result = await openRouterChat(prompt);

    // Ensure result is a string
    return NextResponse.json({ result: result || "No summary returned" });
  } catch (err) {
    console.error("summariseTrial error:", err);
    return NextResponse.json(
      { result: "Failed to summarise trial" },
      { status: 500 }
    );
  }
}
