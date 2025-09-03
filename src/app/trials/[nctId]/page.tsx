'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { PatientProfile } from '@/lib/types';

interface EligibilityModule {
  eligibilityCriteria: string;
  healthyVolunteers: boolean;
  sex: 'FEMALE' | 'MALE' | 'ALL';
  genderBased: boolean;
  genderDescription: string;
  minimumAge: string;
  maximumAge: string;
}

interface Sponsor {
  name?: string;
  class?: string;
}

interface Contact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

interface ProtocolSection {
  identificationModule: {
    nctId: string;
    briefTitle: string;
    officialTitle: string;
    organization: { fullName: string };
  };
  descriptionModule: {
    briefSummary?: string;
    detailedSummary?: string;
  }
  statusModule: {
    overallStatus: string;
    startDate: string;
    completionDate: string;
  };
  eligibilityModule: EligibilityModule;
  sponsorCollaboratorsModule: {
    leadSponsor?: Sponsor;
    collaborators?: Sponsor[];
  };
  contactsLocationsModule: {
    centralContacts?: Contact[];
    locations?: { contacts?: Contact[] }[];
  };
  moreInfoModule: {
    pointOfContact?: Contact;
  };
}

interface Study {
  protocolSection: ProtocolSection;
}

interface PatientResult {
  name: string;
  eligible: boolean;
  explanation: string;
}

export default function TrialPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientUuid = searchParams.get('patientUuid');

  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [results, setResults] = useState<PatientResult[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  const [summarised, setSummarised] = useState(false);
  const [summarisedText, setSummarisedText] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [originalSummary, setOriginalSummary] = useState<string>('');

  useEffect(() => {
    if (!params.nctId) return;
    const fetchStudy = async () => {
      try {
        const res = await fetch(`/api/${params.nctId}`);
        if (!res.ok) throw new Error('Failed to fetch trial');
        const data = await res.json();
        setStudy(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudy();
  }, [params.nctId]);

  useEffect(() => {
    if (!patientUuid) return;
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/users/${patientUuid}`);
        if (!res.ok) throw new Error('Failed to fetch patient');
        const { user } = await res.json();
        setPatientProfile(user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatient();
  }, [patientUuid]);

  useEffect(() => {
    if (!study) return;
    const brief = protocolSection.descriptionModule.briefSummary || '';
    const detailed = protocolSection.descriptionModule.detailedSummary || '';
    const combined = [brief, detailed].filter(Boolean).join('\n\n');
    setOriginalSummary(combined);
  }, [study]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!study) return <p className="text-center mt-10">Study not found.</p>;

  const { protocolSection } = study;
  const {
    identificationModule,
    statusModule,
    eligibilityModule,
    sponsorCollaboratorsModule,
    contactsLocationsModule,
    moreInfoModule,
  } = protocolSection;

  const sponsors = [
    sponsorCollaboratorsModule?.leadSponsor,
    ...(sponsorCollaboratorsModule?.collaborators || []),
  ].filter(Boolean);

  const contacts: Contact[] = [];
  contactsLocationsModule?.centralContacts?.forEach((c) => contacts.push(c));
  contactsLocationsModule?.locations?.forEach((loc) =>
    loc.contacts?.forEach((c) => contacts.push(c))
  );
  if (moreInfoModule?.pointOfContact) contacts.push(moreInfoModule.pointOfContact);

  const handleFilterPatients = async () => {
    if (!patientProfile) return;
    setFiltering(true);
    try {
      const eligibilityStr = JSON.stringify(eligibilityModule);
      const res = await fetch('/api/filterPatients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligibilityCriteria: eligibilityStr, profile: patientProfile }),
      });
      const data = await res.json();
      setResults([
        {
          name: patientProfile.email,
          eligible: data.eligible,
          explanation: data.explanation || 'Unable to determine eligibility',
        },
      ]);
    } catch (err) {
      console.error('Error filtering patient:', err);
    } finally {
      setFiltering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6 bg-[var(--background)] text-[var(--foreground)]">
      {/* Back Button */}
      <button onClick={() => window.history.back()} className="btn-secondary mb-4">
        ← Back
      </button>

      <a
        href={`https://clinicaltrials.gov/ct2/show/${params.nctId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary text-sm"
      >
        View on ClinicalTrials.gov
      </a>

      {/* Study Info */}
      <div className="space-y-2 card-bordered">
        <h1 className="text-3xl font-bold">{identificationModule.briefTitle}</h1>
        <p className="italic opacity-80">{identificationModule.officialTitle}</p>
        <p className="text-sm opacity-70">
          Organization: {identificationModule.organization.fullName}
        </p>
        <p className="text-sm opacity-70">
          Status: <span className="font-semibold">{statusModule.overallStatus}</span> | Start:{' '}
          {statusModule.startDate || 'N/A'} | Completion: {statusModule.completionDate || 'N/A'}
        </p>
        <p className="text-sm opacity-70">Sponsor: {sponsors?.[0]?.name || 'N/A'}</p>
      </div>

      {/* Study Summary */}
      {originalSummary && (
        <div className="card-bordered">
          <details open>
            <summary className="flex justify-between items-center px-4 py-2 font-semibold bg-[var(--color-muted)]/20 rounded cursor-pointer">
              <span>Study Summary</span>
              <button
                className="btn-secondary btn-sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (summarised) {
                    setSummarised(false);
                    return;
                  }

                  if (summarisedText) {
                    setSummarised(true);
                    return;
                  }

                  setLoadingSummary(true);
                  try {
                    const res = await fetch('/api/summariseTrial', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ trialDetails: originalSummary }),
                    });
                    const data = await res.json();
                    if (data.result) {
                      setSummarisedText(data.result);
                      setSummarised(true);
                    }
                  } catch (err) {
                    console.error('Failed to summarise trial:', err);
                  } finally {
                    setLoadingSummary(false);
                  }
                }}
              >
                {loadingSummary ? 'Summarising...' : summarised ? 'Show Original' : 'Summarise'}
              </button>
            </summary>
            <div className="prose prose-invert max-w-none p-4">
              <ReactMarkdown>{summarised ? summarisedText || originalSummary : originalSummary}</ReactMarkdown>
            </div>
          </details>
        </div>
      )}

      {/* Eligibility */}
      <div className="space-y-4 card-bordered">
        <h2 className="text-2xl font-semibold border-b pb-1 border-[var(--color-muted)]">
          Eligibility Criteria
        </h2>

        <div className="prose prose-invert max-w-none bg-[var(--color-secondary-light)] p-4 rounded shadow-sm">
          <ReactMarkdown>
            {eligibilityModule.eligibilityCriteria || 'No eligibility info available.'}
          </ReactMarkdown>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Healthy Volunteers:</span>{' '}
            {eligibilityModule.healthyVolunteers ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Sex:</span> {eligibilityModule.sex}
          </div>
          <div>
            <span className="font-medium">Gender Based:</span>{' '}
            {eligibilityModule.genderBased ? 'Yes' : 'No'}
          </div>
          {eligibilityModule.genderDescription && (
            <div className="md:col-span-2">
              <span className="font-medium">Gender Description:</span>{' '}
              {eligibilityModule.genderDescription}
            </div>
          )}
          <div>
            <span className="font-medium">Minimum Age:</span>{' '}
            {eligibilityModule.minimumAge || 'Not specified'}
          </div>
          <div>
            <span className="font-medium">Maximum Age:</span>{' '}
            {eligibilityModule.maximumAge || 'Not specified'}
          </div>
        </div>

        {patientProfile ? (
          <button
            onClick={handleFilterPatients}
            disabled={filtering}
            className="btn-primary"
          >
            {filtering ? 'Checking Eligibility...' : 'Check My Eligibility'}
          </button>
        ) : (
          <p className="text-[var(--color-danger)]">No patient selected. Provide a UUID in the URL.</p>
        )}
      </div>

      {/* Patient Results */}
      {results.length > 0 && (
        <div className="card-bordered">
          <h3 className="text-xl font-semibold mb-2">Eligibility Results</h3>
          <table className="min-w-full border border-[var(--color-muted)] text-sm rounded overflow-hidden">
            <thead className="bg-[var(--color-muted)]/30">
              <tr>
                <th className="border px-4 py-2 text-left">Eligible</th>
                <th className="border px-4 py-2 text-left">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.name}>
                  <td className="border px-4 py-2">{r.eligible ? 'Yes' : 'No'}</td>
                  <td className="border px-4 py-2">{r.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <div className="card-bordered">
          <details>
            <summary className="cursor-pointer px-4 py-2 font-semibold bg-[var(--color-muted)]/20 rounded">
              Contacts ({contacts.length})
            </summary>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border border-[var(--color-muted)] text-sm rounded overflow-hidden">
                <thead className="bg-[var(--color-muted)]/30">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Role</th>
                    <th className="border px-4 py-2 text-left">Email</th>
                    <th className="border px-4 py-2 text-left">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i}>
                      <td className="border px-4 py-2">{c.name || 'N/A'}</td>
                      <td className="border px-4 py-2">{c.role || 'N/A'}</td>
                      <td className="border px-4 py-2">{c.email || 'N/A'}</td>
                      <td className="border px-4 py-2">{c.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
