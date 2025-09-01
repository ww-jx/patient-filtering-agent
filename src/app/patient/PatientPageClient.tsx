'use client';

import { useState } from "react";
import { useTrialsSearch } from "@/hooks/useTrialsSearch";
import { SearchBar } from "@/components/trials/SearchBar";
import { FilterDropdown } from "@/components/trials/FilterDropdown";
import { SortToggle } from "@/components/trials/SortToggle";
import { DemoQueries } from "@/components/trials/DemoQueries";
import { TrialCard } from "@/components/trials/TrialCard";
import type { PatientProfile } from "@/lib/types";

const demoQueries = ["diabetes", "cancer", "heart disease", "asthma", "HIV"];

interface Props {
  profile: PatientProfile;
}

export default function PatientPageClient({ profile }: Props) {
  const [keywords, setKeywords] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState<string>("");

  const { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder } =
    useTrialsSearch();

  const handleNewSearch = (locationValue?: string) => {
    // use manual location if entered, otherwise fall back to profile country
    const locationToUse = locationValue || profile.country || "";
    fetchStudies(keywords, selectedStatuses, null, true, locationToUse);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 space-y-6 bg-slate-50 text-slate-800">
      <h1 className="text-4xl font-bold text-center">
        Welcome, {profile.email} 👋
      </h1>

      <p className="text-lg text-center">
        Searching near <strong>{manualLocation || profile.country || "your area"}</strong>
      </p>

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex space-x-2">
          <SearchBar
            keywords={keywords}
            setKeywords={setKeywords}
            onSearch={() => handleNewSearch(manualLocation)}
          />

          <FilterDropdown
            selected={selectedStatuses}
            setSelected={setSelectedStatuses}
            isPatient={true}
            patientAddress={{ city: profile.city, country: profile.country }}
            onApply={(locationType, locationValue) => {
              if (locationType === "manual") {
                setManualLocation(locationValue || "");
              } else if (locationType === "profile" && locationValue) {
                const loc = locationValue as { country: string; city?: string };
                const locString = loc.city ? `${loc.city}, ${loc.country}` : loc.country;
                setManualLocation(locString);
              }
            }}
          />

          <SortToggle sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} />

          <button
            onClick={() => handleNewSearch(manualLocation)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <DemoQueries queries={demoQueries} setKeywords={setKeywords} />

      <div className="grid gap-4 w-full max-w-3xl">
        {studies.map((study) => (
          <TrialCard key={study.nctId} study={study} uuid={profile.uuid} />
        ))}
      </div>

      {nextPageToken && (
        <button
          onClick={() =>
            fetchStudies(
              keywords,
              selectedStatuses,
              nextPageToken,
              false,
              manualLocation || profile.country || ""
            )
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Load More
        </button>
      )}
    </div>
  );
}
