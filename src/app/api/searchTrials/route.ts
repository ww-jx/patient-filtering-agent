import { NextRequest, NextResponse } from "next/server";
import { buildEssieQuery } from "@/lib/buildEssieQuery";

// get trials from ClinicalTrials.gov API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get("keywords") || "";
  const statuses = searchParams.get("statuses")?.split(",") || [];
  const location = searchParams.get("location") || "";
  const pageToken = searchParams.get("pageToken") || "";

  console.log("Search params:", { keywords, statuses, location, pageToken });

  if (!keywords) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }

  let queryParams: Record<string, string> = {
    "query.term": keywords,
    format: "json",
    pageSize: "10",
  };

  if (pageToken) queryParams.pageToken = pageToken;

  try {
    // 1️⃣ Try building Essie query using LLM
    const essieQuery = await buildEssieQuery({ keywords, statuses, location });
    console.log("LLM-generated Essie query:", essieQuery);

    // overwrite queryParams with LLM-generated flat keys
    queryParams = { ...queryParams, ...essieQuery.queryParams };
  } catch (err) {
    console.error("LLM Essie query generation failed, falling back to manual params:", err);

    // 2️⃣ Fallback: manually add statuses and location
    if (statuses.length > 0) queryParams["filter.overallStatus"] = statuses.join("|");
    if (location) queryParams["query.locn"] = location;
  }

  const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${new URLSearchParams(queryParams).toString()}`;
  console.log("ClinicalTrials.gov API URL:", apiUrl);

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const text = await res.text();
      console.error("ClinicalTrials.gov API error:", text);
      return NextResponse.json({ error: "Failed to fetch trials" }, { status: 500 });
    }

    const data = await res.json();

    // map to simplified structure
    const studies = (data.studies || []).map((s: any) => {
      const locations =
        s.protocolSection.contactsLocationsModule?.locations?.map((loc: any) => {
          const city = loc.city?.name;
          const state = loc.state?.name;
          const country = loc.country;
          return [city, state, country].filter(Boolean).join(", ");
        }).filter(Boolean) || [];

      return {
        nctId: s.protocolSection.identificationModule.nctId,
        title: s.protocolSection.identificationModule.briefTitle,
        status: s.protocolSection.statusModule.overallStatus,
        startDate: s.protocolSection.statusModule.startDateStruct?.date || "N/A",
        completionDate: s.protocolSection.statusModule.completionDateStruct?.date || "N/A",
        description: s.protocolSection.briefSummary?.textBlock || "",
        locations: [...new Set(locations)],
      };
    });

    return NextResponse.json({
      studies,
      nextPageToken: data.nextPageToken || null,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
