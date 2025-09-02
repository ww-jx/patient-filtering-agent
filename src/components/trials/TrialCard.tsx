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
    <div className="card-bordered shadow-sm space-y-2 p-4 border border-secondary rounded-lg">
      <Link href={trialHref} className="block space-y-2">
        <p className="font-semibold text-lg text-primary">{study.title}</p>

        <p className="text-sm text-muted">
          Status:{' '}
          <span className={`font-medium ${statusColors[study.status] || 'text-foreground'}`}>
            {study.status.replace(/_/g, ' ')}
          </span>
        </p>

        <p className="text-sm text-muted">
          Start: {study.startDate} | Completion: {study.completionDate}
        </p>

        {study.description && (
          <p className="text-sm">
            {truncatedDescription}{' '}
            {study.description.length > MAX_DESC && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent Link click
                  e.preventDefault();  // optional: prevent any default behavior
                  toggleDesc();
                }}
                className="text-primary font-semibold ml-1 hover:underline"
              >
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        )}

        {study.locations.length > 0 && (
          <p className="text-sm text-muted">
            <span className="font-semibold">Locations:</span> {truncatedLocations}{' '}
            {study.locations.join(' • ').length > MAX_LOC && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleLoc();
                }}
                className="text-primary font-semibold ml-1 hover:underline"
              >
                {locExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        )}
      </Link>

      <a
        href={`https://clinicaltrials.gov/ct2/show/${study.nctId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary text-sm"
      >
        View on ClinicalTrials.gov
      </a>
    </div>
  );
};
