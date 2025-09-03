import { useState } from 'react';

interface Study {
  nctId: string;
  title: string;
  status: string;
  startDate: string;
  completionDate: string;
  description: string;
  locations?: string[];
}

interface SearchTrialsResponse {
  studies: Study[];
  nextPageToken?: string | null;
  prevParams?: string | null;
}

export const useTrialsSearch = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevParams, setPrevParams] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchStudies = async (
    keywords: string,
    selectedStatuses: string[],
    token: string | null = null,
    newSearch = false,
    location?: string
  ) => {
    if (!keywords.trim()) {
      setStudies([]);
      setNextPageToken(null);
      setPrevParams(null);
      return;
    }

    setLoading(true);

    try {
      const url = new URL('/api/searchTrials', window.location.origin);
      url.searchParams.set('keywords', keywords);

      if (selectedStatuses.length > 0) {
        url.searchParams.set('statuses', selectedStatuses.join(','));
      }

      if (location) {
        url.searchParams.set('location', location);
      }

      if (token && prevParams) {
        url.searchParams.set('pageToken', token);
        url.searchParams.set('prevParams', prevParams); // base search params only
      }

      const res = await fetch(url.toString());
      const data: SearchTrialsResponse = await res.json();

      const filtered = (data.studies || []).filter(s =>
        selectedStatuses.length === 0 || selectedStatuses.includes(s.status)
      );

      const sorted = filtered.sort((a, b) => {
        const aDate = a.startDate && a.startDate !== 'N/A' ? new Date(a.startDate).getTime() : 0;
        const bDate = b.startDate && b.startDate !== 'N/A' ? new Date(b.startDate).getTime() : 0;
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      });

      if (newSearch) setStudies(sorted);
      else setStudies(prev => [...prev, ...sorted]);

      setNextPageToken(data.nextPageToken || null);
      setPrevParams(data.prevParams || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    setStudies(prev =>
      [...prev].sort((a, b) => {
        const aDate = a.startDate && a.startDate !== 'N/A' ? new Date(a.startDate).getTime() : 0;
        const bDate = b.startDate && b.startDate !== 'N/A' ? new Date(b.startDate).getTime() : 0;
        return sortOrder === 'desc' ? aDate - bDate : bDate - aDate;
      })
    );
  };

  return { studies, nextPageToken, loading, sortOrder, fetchStudies, toggleSortOrder };
};
