'use client';

import { useState, useRef } from "react";
import { useTrialsSearch } from "@/hooks/useTrialsSearch";
import { SearchBar } from "@/components/trials/SearchBar";
import { FilterDropdown } from "@/components/trials/FilterDropdown";
import { SortToggle } from "@/components/trials/SortToggle";
import { DemoQueries } from "@/components/trials/DemoQueries";
import { TrialCard } from "@/components/trials/TrialCard";

const demoQueries = ["diabetes", "cancer", "heart disease", "asthma", "HIV"];
const allowedStatuses = ["ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION", "NOT_YET_RECRUITING", "RECRUITING", "AVAILABLE"];

export default function SponsorPage() {
  const [keywords, setKeywords] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder } =
    useTrialsSearch();

  const handleNewSearch = () => {
    fetchStudies(keywords, selectedStatuses, null, true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 space-y-6 bg-slate-50 text-slate-800">
      <h1 className="text-4xl font-bold text-center">Sponsor ClinicalTrials Search</h1>

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex space-x-2">
          <SearchBar keywords={keywords} setKeywords={setKeywords} onSearch={handleNewSearch} />
          <FilterDropdown selected={selectedStatuses} setSelected={setSelectedStatuses} onApply={handleNewSearch} />
          <SortToggle sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} />
          <button onClick={handleNewSearch} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <DemoQueries queries={demoQueries} setKeywords={setKeywords} onSelect={handleNewSearch} />

      <div className="grid gap-4 w-full max-w-3xl">
        {studies.map((study) => <TrialCard key={study.nctId} study={study} />)}
      </div>

      {nextPageToken && <button onClick={() => fetchStudies(keywords, selectedStatuses, nextPageToken)} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Load More</button>}
    </div>
  );
}
