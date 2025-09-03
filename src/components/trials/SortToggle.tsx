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
      className="bg-white/90 hover:bg-white border border-white/60 hover:border-primary/30 text-slate-700 hover:text-primary h-12 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm backdrop-blur-sm hover:scale-[1.02]"
    >
      <ArrowUpDown className="h-4 w-4" />
      <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
    </button>
  );
};
