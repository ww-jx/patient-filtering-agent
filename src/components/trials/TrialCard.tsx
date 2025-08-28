'use client';

import Link from 'next/link';

interface Study {
  nctId: string;
  title: string;
  status: string;
  startDate: string;
  completionDate: string;
  description: string;
  locations: string[];
}

const priorityStatuses = ['RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION'];

interface TrialCardProps {
  study: Study;
  patientFile?: string;
}

export const TrialCard = ({ study, patientFile }: TrialCardProps) => {
  const trialHref = patientFile
    ? `/trials/${study.nctId}?patientFile=${encodeURIComponent(patientFile)}`
    : `/trials/${study.nctId}`;
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
      {/* Clicking anywhere on this section goes to your internal trial page */}
      <Link href={trialHref} className="block space-y-2">
        <p className="font-semibold text-lg">{study.title}</p>

        <p className="text-sm text-gray-600">
          Status:{' '}
          <span
            className={`font-medium ${priorityStatuses.includes(study.status) ? 'text-green-600' : 'text-slate-800'
              }`}
          >
            {study.status.replace(/_/g, ' ')}
          </span>
        </p>

        <p className="text-sm text-gray-600">
          Start: {study.startDate} | Completion: {study.completionDate}
        </p>

        {study.description && (
          <p className="text-sm text-gray-700">{study.description}</p>
        )}

        {study.locations.length > 0 && (
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Locations:</span>{' '}
            {study.locations.join(' • ')}
          </p>
        )}
      </Link>

      {/* External link button */}
      <a
        href={`https://clinicaltrials.gov/ct2/show/${study.nctId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
      >
        View on ClinicalTrials.gov
      </a>
    </div >
  );
};
