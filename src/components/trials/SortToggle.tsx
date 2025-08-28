'use client';

import { ArrowUpDown } from 'lucide-react';

interface SortToggleProps {
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
}

export const SortToggle = ({ sortOrder, toggleSortOrder }: SortToggleProps) => {
  return (
    <button
      onClick={toggleSortOrder}
      className="bg-white border border-slate-300 rounded-lg p-3 text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1"
    >
      <ArrowUpDown className="h-5 w-5" />
      <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
    </button>
  );
};
