'use client';

import { useState, useEffect } from "react";
import { useTrialsSearch } from "@/hooks/useTrialsSearch";
import { SearchBar } from "@/components/trials/SearchBar";
import { FilterDropdown } from "@/components/trials/FilterDropdown";
import { SortToggle } from "@/components/trials/SortToggle";
import { DemoQueries } from "@/components/trials/DemoQueries";
import { TrialCard } from "@/components/trials/TrialCard";
import type { PatientProfile } from "@/lib/types";

const demoQueriesSets = [
  [
    "Breast cancer trials without chemotherapy",
    "Diabetes studies using insulin pumps",
    "Heart disease trials near Tokyo",
    "HIV prevention studies for young adults"
  ],
  [
    "Alzheimer's disease treatment studies",
    "Multiple sclerosis clinical trials",
    "Parkinson's disease research studies",
    "Lung cancer immunotherapy trials"
  ],
  [
    "Rheumatoid arthritis biologic studies",
    "Depression and anxiety treatment trials",
    "Migraine prevention clinical studies",
    "Chronic pain management research"
  ],
  [
    "COVID-19 long haul treatment studies",
    "Obesity and weight loss trials",
    "Sleep disorder research studies",
    "Hypertension medication trials"
  ],
  [
    "Psoriasis treatment clinical trials",
    "Inflammatory bowel disease studies",
    "Chronic kidney disease research",
    "Osteoporosis prevention trials"
  ]
];

interface Props {
  profile: PatientProfile;
}

export default function PatientHome({ profile }: Props) {
  const [keywords, setKeywords] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState<string>("");
  const [currentQuerySetIndex, setCurrentQuerySetIndex] = useState(0);

  const { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder } =
    useTrialsSearch();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Rotate through query sets every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuerySetIndex((prev) => (prev + 1) % demoQueriesSets.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleNewSearch = (locationValue?: string) => {
    const locationToUse = locationValue || profile.country || "";
    fetchStudies(keywords, selectedStatuses, null, true, locationToUse);
  };

  const currentDemoQueries = demoQueriesSets[currentQuerySetIndex];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-warm-50 via-white to-brand-50">
      {/* Hero Section with Aurora Background */}
      <section className="relative z-10 overflow-visible">
        <div className="absolute inset-0 bg-aurora animate-gradient opacity-40"></div>
        <div className="absolute inset-0 col-grid text-slate-400"></div>

        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">
                Welcome, {profile.firstName} 👋
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Describe what you are looking for, we&apos;ll handle the rest for you.
              </p>
            </div>

            {/* Enhanced Search Interface */}
            <div className="max-w-4xl mx-auto">
              {/* Search Bar - Enhanced with glass morphism */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 blur-xl opacity-20 bg-gradient-to-r from-[var(--color-primary)]/30 via-[var(--color-secondary)]/30 to-[var(--color-medical-500)]/30 rounded-2xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-1 shadow-xl-soft">
                    <SearchBar
                      keywords={keywords}
                      setKeywords={setKeywords}
                      onSearch={() => handleNewSearch(manualLocation)}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Filters - Enhanced with consistent styling */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
                <div className="relative z-50 bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-1 shadow-lg">
                  <FilterDropdown
                    selected={selectedStatuses}
                    setSelected={setSelectedStatuses}
                    isPatient={true}
                    patientAddress={{ city: profile.city, country: profile.country }}
                    onApply={(locationType, locationValue) => {
                      if (locationType === "manual") {
                        setManualLocation(typeof locationValue === 'string' ? locationValue : "");
                      } else if (locationType === "profile" && locationValue) {
                        const loc = locationValue as { country: string; city?: string };
                        setManualLocation(loc.city ? `${loc.city}, ${loc.country}` : loc.country);
                      }
                    }}
                  />
                </div>
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-1 shadow-lg">
                  <SortToggle sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} />
                </div>
              </div>

              {/* Demo Queries - Enhanced with glass morphism */}
              {studies.length === 0 && (
                <div className="mb-8">
                  <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-[var(--color-primary)] text-center">Try these sample searches:</h3>
                      <div className="flex gap-1">
                        {demoQueriesSets.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentQuerySetIndex
                              ? 'bg-[var(--color-primary)]'
                              : 'bg-[var(--color-primary)]/30'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <DemoQueries
                      queries={currentDemoQueries}
                      setKeywords={setKeywords}
                      key={currentQuerySetIndex} // Force re-render for animation
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section - Enhanced background */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-transparent via-white/50 to-warm-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {studies.length > 0 && (
            <div className="mb-8">
              <div className="text-center bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)] mb-2">
                  Clinical Trials Found
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  {studies.length} trial{studies.length !== 1 ? 's' : ''} matching your criteria
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-[var(--color-secondary)] rounded-full animate-pulse"></div>
                  <span>Real-time results from ClinicalTrials.gov</span>
                </div>
              </div>
            </div>
          )}

          {/* No Results Found */}
          {!loading && studies.length === 0 && keywords && (
            <div className="mb-8">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto text-center">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="w-10 h-10 text-[var(--color-primary)]/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008h-.008V9.75zM9 13.5h6m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-[var(--color-primary)]">
                    No Results Found
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                    We couldn’t find any clinical trials matching your criteria.
                    Try adjusting your filters, keywords, or location and search again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial Cards Grid - Enhanced with staggered animation */}
          <div className="grid gap-4 sm:gap-6 max-w-4xl mx-auto">
            {studies.map((study, index) => (
              <div
                key={study.nctId}
                className="w-full transform transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-secondary)]/20 to-[var(--color-medical-500)]/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <TrialCard study={{ ...study, locations: study.locations || [] }} uuid={profile.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button - Enhanced with glass morphism */}
          {nextPageToken && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-medical-500)] rounded-2xl blur opacity-30"></div>
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
                  className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-enhanced"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Loading more trials...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Load More Trials</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating elements for visual interest */}
      <div className="fixed bottom-8 right-8 pointer-events-none z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      <div className="fixed top-1/4 left-8 pointer-events-none z-10">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-medical-500)]/20 to-[var(--color-primary)]/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
