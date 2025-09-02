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
      className="btn-primary h-8 md:h-10 lg:h-12 flex items-center space-x-1"
    >
      <ArrowUpDown className="h-5 w-5" />
      <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
    </button>
  );
};
