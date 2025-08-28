'use client';

import { useState } from "react";
import { useTrialsSearch } from "@/hooks/useTrialsSearch";
import { SearchBar } from "@/components/trials/SearchBar";
import { FilterDropdown } from "@/components/trials/FilterDropdown";
import { SortToggle } from "@/components/trials/SortToggle";
import { DemoQueries } from "@/components/trials/DemoQueries";
import { TrialCard } from "@/components/trials/TrialCard";
import type { PatientProfile } from "@/lib/parseXml";

const demoQueries = ["diabetes", "cancer", "heart disease", "asthma", "HIV"];

export default function PatientPageClient({ profile }: { profile: PatientProfile }) {
  const [keywords, setKeywords] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState<string>("");

  const { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder } =
    useTrialsSearch();

  const handleNewSearch = (locationValue?: string) => {
    const locationToUse = locationValue || profile.city; // fallback to profile city
    fetchStudies(keywords, selectedStatuses, null, true, locationToUse);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 space-y-6 bg-slate-50 text-slate-800">
      <h1 className="text-4xl font-bold text-center">
        Welcome, {profile.name} 👋
      </h1>
      <p className="text-slate-600 text-center">
        Searching for trials near {profile.city}, {profile.state} ({profile.postalCode})
      </p>

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex space-x-2">
          <SearchBar keywords={keywords} setKeywords={setKeywords} onSearch={() => handleNewSearch(manualLocation)} />

          <FilterDropdown
            selected={selectedStatuses}
            setSelected={setSelectedStatuses}
            patientAddress={`${profile.city}, ${profile.state}`}
            isPatient={true}
            onApply={(locationType, locationValue) => {
              // Determine which location to use
              const loc = locationType === "manual" ? locationValue : `${profile.city}, ${profile.state}`;
              setManualLocation(locationType === "manual" ? locationValue || "" : "");
              handleNewSearch(loc);
            }}
          />

          <SortToggle sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} />

          <button onClick={() => handleNewSearch(manualLocation)} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <DemoQueries queries={demoQueries} setKeywords={setKeywords} onSelect={() => handleNewSearch(manualLocation)} />

      <div className="grid gap-4 w-full max-w-3xl">
        {studies.map((study) => <TrialCard key={study.nctId} study={study} patientFile={profile.fileName} />)}
      </div>

      {nextPageToken && (
        <button onClick={() => fetchStudies(keywords, selectedStatuses, nextPageToken, false, manualLocation)} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Load More
        </button>
      )}
    </div>
  );
}
