import { NextRequest, NextResponse } from "next/server";
import { buildCtgQuery } from "@/lib/buildCtgQuery";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get("keywords") || "";
  const statuses = searchParams.get("statuses")?.split(",") || [];
  const location = searchParams.get("location") || "";
  const pageToken = searchParams.get("pageToken") || "";
  const prevParamsRaw = searchParams.get("prevParams"); // base search params only

  if (!keywords) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }

  // Base query params
  let queryParams: Record<string, string> = {
    format: "json",
    pageSize: "10",
  };

  if (pageToken && prevParamsRaw) {
    // Next page: use the previous base search params, append new pageToken
    try {
      const baseParams = JSON.parse(prevParamsRaw);
      queryParams = { ...baseParams, pageToken };
    } catch (err) {
      console.error("Failed to parse prevParams:", err);
    }
  } else {
    // New search: build query
    try {
      const ctgQuery = await buildCtgQuery({ keywords, statuses, location });
      queryParams = { ...queryParams, ...ctgQuery.queryParams };
    } catch (err) {
      console.error("LLM query failed, fallback to manual params:", err);
      if (statuses.length > 0) queryParams["filter.overallStatus"] = statuses.join("|");
      if (location) queryParams["query.locn"] = location;
    }
  }

  const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${new URLSearchParams(queryParams).toString()}`;
  console.log("ClinicalTrials.gov API query:", apiUrl);

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const text = await res.text();
      console.error("ClinicalTrials.gov API error:", text);
      return NextResponse.json({ error: "Failed to fetch trials" }, { status: 500 });
    }

    const data = await res.json();

    const studies = (data.studies || []).map((s: any) => {
      const locations =
        s.protocolSection.contactsLocationsModule?.locations?.map((loc: any) =>
          [loc.city, loc.state, loc.country].filter(Boolean).join(", ")
        ).filter(Boolean) || [];

      return {
        nctId: s.protocolSection.identificationModule.nctId,
        title: s.protocolSection.identificationModule.briefTitle,
        status: s.protocolSection.statusModule.overallStatus,
        startDate: s.protocolSection.statusModule.startDateStruct?.date || "N/A",
        completionDate: s.protocolSection.statusModule.completionDateStruct?.date || "N/A",
        description: s.protocolSection.descriptionModule.briefSummary || "",
        locations: [...new Set(locations)],
      };
    });

    // Return next page token and base params (without pageToken)
    const { pageToken: _, ...baseParamsWithoutToken } = queryParams;

    return NextResponse.json({
      studies,
      nextPageToken: data.nextPageToken || null,
      prevParams: JSON.stringify(baseParamsWithoutToken),
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
