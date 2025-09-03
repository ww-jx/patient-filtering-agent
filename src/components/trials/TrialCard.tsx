'use client';

import { useState } from 'react';

interface Study {
  nctId: string;
  title: string;
  status: string;
  startDate: string;
  completionDate: string;
  description: string;
  locations: string[];
}

interface TrialCardProps {
  study: Study;
  uuid: string;
}

// Map each status to a color class and background
const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  RECRUITING: { 
    text: 'text-[var(--color-success)]', 
    bg: 'bg-[var(--color-success)]/10', 
    border: 'border-[var(--color-success)]/30' 
  },
  NOT_YET_RECRUITING: { 
    text: 'text-[var(--color-secondary)]', 
    bg: 'bg-[var(--color-secondary)]/10', 
    border: 'border-[var(--color-secondary)]/30' 
  },
  ENROLLING_BY_INVITATION: { 
    text: 'text-[var(--color-primary)]', 
    bg: 'bg-[var(--color-primary)]/10', 
    border: 'border-[var(--color-primary)]/30' 
  },
  ACTIVE_NOT_RECRUITING: { 
    text: 'text-[var(--color-muted)]', 
    bg: 'bg-[var(--color-muted)]/10', 
    border: 'border-[var(--color-muted)]/30' 
  },
  COMPLETED: { 
    text: 'text-[var(--color-muted)]', 
    bg: 'bg-[var(--color-muted)]/10', 
    border: 'border-[var(--color-muted)]/30' 
  },
  TERMINATED: { 
    text: 'text-[var(--color-danger)]', 
    bg: 'bg-[var(--color-danger)]/10', 
    border: 'border-[var(--color-danger)]/30' 
  },
  WITHDRAWN: { 
    text: 'text-[var(--color-danger)]', 
    bg: 'bg-[var(--color-danger)]/10', 
    border: 'border-[var(--color-danger)]/30' 
  },
};

export const TrialCard = ({ study, uuid }: TrialCardProps) => {
  const trialHref = `/trials/${study.nctId}?patientUuid=${uuid}`;
  const [descExpanded, setDescExpanded] = useState(false);
  const [locExpanded, setLocExpanded] = useState(false);

  const MAX_DESC = 100; // chars
  const MAX_LOC = 50;   // chars

  const toggleDesc = () => setDescExpanded(!descExpanded);
  const toggleLoc = () => setLocExpanded(!locExpanded);

  const truncatedDescription =
    study.description.length > MAX_DESC && !descExpanded
      ? study.description.slice(0, MAX_DESC) + '...'
      : study.description;

  const truncatedLocations =
    study.locations.join(' • ').length > MAX_LOC && !locExpanded
      ? study.locations.join(' • ').slice(0, MAX_LOC) + '...'
      : study.locations.join(' • ');

  const statusStyle = statusColors[study.status] || {
    text: 'text-[var(--foreground)]',
    bg: 'bg-[var(--color-muted)]/10',
    border: 'border-[var(--color-muted)]/30'
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[var(--color-secondary)]/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 hover:border-[var(--color-primary)]/30 marketing-card card-interactive">
      <a href={trialHref} target="_blank" rel="noopener noreferrer" className="block space-y-4 sm:space-y-5">
        {/* Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <h3 className="font-semibold text-base sm:text-lg text-[var(--color-primary)] leading-tight flex-1">
            {study.title}
          </h3>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusStyle.text} ${statusStyle.bg} ${statusStyle.border} self-start`}>
            {study.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <span className="text-[var(--color-secondary)] text-base">📅</span>
            <span className="font-medium">Start:</span>
            <span className="text-[var(--foreground)]">{study.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <span className="text-[var(--color-primary)] text-base">⏰</span>
            <span className="font-medium">Completion:</span>
            <span className="text-[var(--foreground)]">{study.completionDate}</span>
          </div>
        </div>

        {/* Description */}
        {study.description && (
          <div className="text-sm leading-relaxed bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
            <p className="text-[var(--foreground)]">
              {truncatedDescription}
              {study.description.length > MAX_DESC && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleDesc();
                  }}
                  className="text-[var(--color-primary)] font-medium ml-1 hover:underline focus:underline focus:outline-none transition-colors"
                >
                  {descExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Locations */}
        {study.locations.length > 0 && (
          <div className="text-sm bg-[var(--color-primary-light)]/20 p-4 rounded-lg border border-[var(--color-primary)]/20">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-secondary)] text-base mt-0.5">📍</span>
              <div className="flex-1">
                <span className="font-medium text-[var(--color-primary)] block mb-1">Locations:</span>
                <span className="text-[var(--foreground)]">
                  {truncatedLocations}
                  {study.locations.join(' • ').length > MAX_LOC && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleLoc();
                      }}
                      className="text-[var(--color-primary)] font-medium ml-1 hover:underline focus:underline focus:outline-none transition-colors"
                    >
                      {locExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </a>

      {/* Action Button */}
      <div className="pt-4 sm:pt-5 border-t border-[var(--color-primary)]/10">
        <a
          href={`https://clinicaltrials.gov/ct2/show/${study.nctId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] shadow-brand btn-enhanced"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View on ClinicalTrials.gov</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};
