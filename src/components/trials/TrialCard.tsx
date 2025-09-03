'use client';

import Link from 'next/link';
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

// Map each status to a color class
const statusColors: Record<string, string> = {
  RECRUITING: 'text-success',
  NOT_YET_RECRUITING: 'text-yellow-400',
  ENROLLING_BY_INVITATION: 'text-primary',
  ACTIVE_NOT_RECRUITING: 'text-muted',
  COMPLETED: 'text-muted',
  TERMINATED: 'text-danger',
  WITHDRAWN: 'text-danger',
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

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 hover:border-primary/20">
      <Link href={trialHref} className="block space-y-4 sm:space-y-5">
        {/* Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <h3 className="font-semibold text-base sm:text-lg text-primary leading-tight flex-1">
            {study.title}
          </h3>
          <span className={`status-badge self-start ${statusColors[study.status] || 'text-foreground'}`}>
            {study.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-muted">
          <span className="flex items-center gap-1">
            <span className="text-brand-500">📅</span>
            Start: {study.startDate}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-medical-500">⏰</span>
            Completion: {study.completionDate}
          </span>
        </div>

        {/* Description */}
        {study.description && (
          <div className="text-sm leading-relaxed">
            <p className="text-foreground">
              {truncatedDescription}
              {study.description.length > MAX_DESC && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleDesc();
                  }}
                  className="text-primary font-medium ml-1 hover:underline focus:underline focus:outline-none"
                >
                  {descExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Locations */}
        {study.locations.length > 0 && (
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <span className="text-warm-500 mt-0.5">📍</span>
              <div className="flex-1">
                <span className="font-medium text-muted">Locations: </span>
                <span className="text-foreground">
                  {truncatedLocations}
                  {study.locations.join(' • ').length > MAX_LOC && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleLoc();
                      }}
                      className="text-primary font-medium ml-1 hover:underline focus:underline focus:outline-none"
                    >
                      {locExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Link>

      {/* Action Button */}
      <div className="pt-4 sm:pt-5 border-t border-primary/10">
        <a
          href={`https://clinicaltrials.gov/ct2/show/${study.nctId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-primary to-secondary text-white text-sm w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
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
