'use client';

import { useState } from "react";
import { useTrialsSearch } from "@/hooks/useTrialsSearch";
import { SearchBar } from "@/components/trials/SearchBar";
import { FilterDropdown } from "@/components/trials/FilterDropdown";
import { SortToggle } from "@/components/trials/SortToggle";
import { DemoQueries } from "@/components/trials/DemoQueries";
import { TrialCard } from "@/components/trials/TrialCard";
import type { PatientProfile } from "@/lib/types";

const demoQueries = [
  "Breast cancer trials without chemotherapy",
  "Diabetes studies using insulin pumps",
  "Heart disease trials near Tokyo",
  "HIV prevention studies for young adults"
];

interface Props {
  profile: PatientProfile;
}

export default function PatientHome({ profile }: Props) {
  const [keywords, setKeywords] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState<string>("");

  const { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder } =
    useTrialsSearch();

  const handleNewSearch = (locationValue?: string) => {
    const locationToUse = locationValue || profile.country || "";
    fetchStudies(keywords, selectedStatuses, null, true, locationToUse);
  };

  return (
    <div className="relative flex flex-col items-center justify-start px-4 sm:px-6 md:px-12 py-8 space-y-6 bg-background text-foreground">


      {/* Search + Filters */}
      <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          Welcome, {profile.firstName} 👋
        </h1>

        <p className="text-center text-sm sm:text-base text-muted">
          Describe what you are looking for, we'll handle the rest for you.
        </p>

        <div className="w-full flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              keywords={keywords}
              setKeywords={setKeywords}
              onSearch={() => handleNewSearch(manualLocation)}
              loading={loading}
            />
          </div>

          <div className="flex gap-4">
            <FilterDropdown
              selected={selectedStatuses}
              setSelected={setSelectedStatuses}
              isPatient={true}
              patientAddress={{ city: profile.city, country: profile.country }}
              onApply={(locationType, locationValue) => {
                if (locationType === "manual") setManualLocation(locationValue || "");
                else if (locationType === "profile" && locationValue) {
                  const loc = locationValue as { country: string; city?: string };
                  setManualLocation(loc.city ? `${loc.city}, ${loc.country}` : loc.country);
                }
              }}
            />
            <SortToggle sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} />
          </div>
        </div>

        {studies.length === 0 && <DemoQueries queries={demoQueries} setKeywords={setKeywords} />}

        <div className="grid gap-4 w-full justify-center">
          {studies.map((study) => (
            <div key={study.nctId} className="w-full sm:w-[95%] md:w-full max-w-3xl">
              <TrialCard study={study} uuid={profile.id} />
            </div>
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
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover"
          >
            Load More
          </button>
        )}
      </div>

    </div>
  );
}
