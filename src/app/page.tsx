'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Filter } from 'lucide-react';

interface Study {
  nctId: string;
  title: string;
  status: string;
  description: string;
}

interface ApiResponse {
  studies: Study[];
  nextPageToken: string | null;
}

const allStatuses = [
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'ENROLLING_BY_INVITATION',
  'NOT_YET_RECRUITING',
  'RECRUITING',
  'SUSPENDED',
  'TERMINATED',
  'WITHDRAWN',
  'AVAILABLE',
  'NO_LONGER_AVAILABLE',
  'TEMPORARILY_NOT_AVAILABLE',
  'APPROVED_FOR_MARKETING',
  'WITHHELD',
  'UNKNOWN',
];

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // fetch ClinicalTrials studies
  const fetchStudies = async (token: string | null = null, newSearch = false) => {
    if (!keywords.trim()) {
      setStudies([]);
      setNextPageToken(null);
      return;
    }

    setLoading(true);
    try {
      const url = new URL('/api/searchTrials', window.location.origin);
      url.searchParams.set('keywords', keywords);

      // status filtering if any are selected
      if (selectedStatuses.length > 0) {
        url.searchParams.set('filter.overallStatus', selectedStatuses.join('|'));
      }

      if (token) url.searchParams.set('pageToken', token);

      const res = await fetch(url.toString());
      const data: ApiResponse = await res.json();

      // for a new search, replace the results. For pagination, append them.
      if (newSearch) {
        setStudies(data.studies || []);
      } else {
        setStudies((prevStudies) => [...prevStudies, ...(data.studies || [])]);
      }

      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error('Error fetching studies:', err);
    } finally {
      setLoading(false);
    }
  };

  // new search
  const handleNewSearch = () => {
    setNextPageToken(null);
    fetchStudies(null, true);
  };

  // pagination
  const handleNextPage = () => {
    if (nextPageToken) {
      fetchStudies(nextPageToken, false);
    }
  };

  // checkbox changes for statuses
  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 space-y-6 bg-slate-50 text-slate-800">
      <h1 className="text-4xl font-bold text-center">ClinicalTrials Patient Eligibility</h1>

      {/* Search and Filter Section */}
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex space-x-2">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Enter condition or keyword..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewSearch()}
              className="w-full border rounded-lg p-3 pl-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>

          {/* Filter Dropdown */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-slate-300 rounded-lg p-3 text-slate-700 hover:bg-slate-100 transition-colors flex items-center space-x-1"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {selectedStatuses.length > 0 && (
                <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                  {selectedStatuses.length}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute z-10 top-full mt-2 w-64 p-4 bg-white border border-slate-200 rounded-lg shadow-xl animate-fade-in-down">
                <h3 className="font-semibold text-sm mb-2 text-slate-800">Overall Status</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                        className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      handleNewSearch();
                      setShowFilters(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNewSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.062 0 014 12c0-3.042 1.135-5.824 3-7.938l1.42 1.42A6 6 0 006 12z"></path>
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* ClinicalTrials results */}
      <div className="grid gap-4 w-full max-w-3xl">
        {studies.length > 0 ? (
          studies.map((study) => (
            <Link key={study.nctId} href={`/trials/${study.nctId}`}>
              <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-lg">{study.title}</p>
                <p className="text-sm text-gray-600 mt-1">Status: <span className="font-medium text-slate-800">{study.status}</span></p>
                {study.description && (
                  <p className="text-sm text-gray-700 mt-2">{study.description}</p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-slate-500 mt-10">
            {loading ? 'Searching...' : 'Search for a condition to find clinical trials.'}
          </p>
        )}
      </div>

      {/* Next Page button */}
      {nextPageToken && (
        <button
          onClick={handleNextPage}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading More...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
