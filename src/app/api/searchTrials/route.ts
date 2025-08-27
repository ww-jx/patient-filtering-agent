import { NextRequest, NextResponse } from "next/server";

// get trials from ClinicalTrials.gov API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get("keywords");

  if (!keywords) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      "query.term": keywords,
      format: "json",
      pageSize: "10",
    });

    // optional status filter
    const statusFilter = searchParams.get("filter.overallStatus");
    if (statusFilter) {
      params.set("filter.overallStatus", statusFilter);
    }

    if (searchParams.get("pageToken")) {
      params.set("pageToken", searchParams.get("pageToken")!);
    }

    const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params.toString()}`);

    if (!res.ok) {
      const text = await res.text();
      console.error("ClinicalTrials.gov API error:", text);
      return NextResponse.json({ error: "Failed to fetch trials" }, { status: 500 });
    }

    const data = await res.json();

    // map to simplified structure
    const studies = (data.studies || []).map((s: any) => ({
      nctId: s.protocolSection.identificationModule.nctId,
      title: s.protocolSection.identificationModule.briefTitle,
      status: s.protocolSection.statusModule.overallStatus,
      description: s.protocolSection.briefSummary?.textBlock || "",
    }));

    return NextResponse.json({
      studies,
      nextPageToken: data.nextPageToken || null,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
