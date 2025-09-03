'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { PatientProfile } from '@/lib/types';

// Helper function to format eligibility criteria text
const formatEligibilityText = (text: string): string => {
  if (!text) return 'No eligibility information available.';
  
  // Split by common patterns and format as list items
  return text
    .split(/(?:\n|\r\n|\r)(?=\s*[-•*]|\s*\d+\.)/g)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove existing bullet points and numbering
      const cleaned = line.replace(/^\s*[-•*]\s*|^\s*\d+\.\s*/, '').trim();
      return cleaned;
    })
    .filter(line => line.length > 0)
    .map(line => `• ${line}`)
    .join('\n\n');
};

// Helper function to format study summary with better structure
const formatStudySummary = (text: string): string => {
  if (!text) return '';
  
  // Split into paragraphs and format
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .join('\n\n');
};

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
    const brief = study.protocolSection.descriptionModule.briefSummary || '';
    const detailed = study.protocolSection.descriptionModule.detailedSummary || '';
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
      <button onClick={() => window.location.href = '/'} className="btn-secondary mb-4">
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
        <div className="card-bordered bg-gradient-to-br from-white to-[var(--color-primary-light)]/10">
          <details open>
            <summary className="flex justify-between items-center px-6 py-4 font-semibold bg-[var(--color-primary)]/10 rounded-lg cursor-pointer hover:bg-[var(--color-primary)]/15 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <span className="text-xl text-[var(--color-primary)]">Study Summary</span>
              </div>
              <button
                className="btn-secondary text-sm px-4 py-2"
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
                {loadingSummary ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-shimmer w-4 h-4 rounded"></span>
                    Summarising...
                  </span>
                ) : summarised ? 'Show Original' : 'Summarise'}
              </button>
            </summary>
            <div className="mt-4 p-6 bg-white rounded-lg border border-[var(--color-primary)]/20 shadow-sm">
              <div className="medical-content max-w-none">
                <ReactMarkdown>
                  {formatStudySummary(summarised ? summarisedText || originalSummary : originalSummary)}
                </ReactMarkdown>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Eligibility */}
      <div className="space-y-6 card-bordered bg-gradient-to-br from-white to-[var(--color-secondary-light)]/20">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-primary)]/20">
          <span className="text-3xl">✅</span>
          <h2 className="text-2xl font-semibold text-[var(--color-primary)]">
            Eligibility Criteria
          </h2>
        </div>

        {/* Main Eligibility Text */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-secondary)]/30 shadow-sm">
          <div className="medical-content max-w-none">
            <div className="space-y-3">
              {formatEligibilityText(eligibilityModule.eligibilityCriteria).split('\n\n').map((item, index) => (
                <div key={index} className="eligibility-item bg-[var(--color-secondary-light)]/30 hover:bg-[var(--color-secondary-light)]/50 transition-colors p-4 rounded-lg border border-[var(--color-secondary)]/10">
                  <span className="text-readable">{item.replace(/^•\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility Details Grid */}
        <div className="bg-[var(--color-primary-light)]/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2">
            <span>📊</span>
            Key Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🩺</span>
                <span className="font-medium text-[var(--color-primary)]">Healthy Volunteers</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                eligibilityModule.healthyVolunteers 
                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' 
                  : 'bg-[var(--color-muted)]/20 text-[var(--color-muted)]'
              }`}>
                {eligibilityModule.healthyVolunteers ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👤</span>
                <span className="font-medium text-[var(--color-primary)]">Sex</span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]">
                {eligibilityModule.sex}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚧</span>
                <span className="font-medium text-[var(--color-primary)]">Gender Based</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                eligibilityModule.genderBased 
                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' 
                  : 'bg-[var(--color-muted)]/20 text-[var(--color-muted)]'
              }`}>
                {eligibilityModule.genderBased ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎂</span>
                <span className="font-medium text-[var(--color-primary)]">Minimum Age</span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]">
                {eligibilityModule.minimumAge || 'Not specified'}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="font-medium text-[var(--color-primary)]">Maximum Age</span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]">
                {eligibilityModule.maximumAge || 'Not specified'}
              </span>
            </div>
            
            {eligibilityModule.genderDescription && (
              <div className="bg-white rounded-lg p-4 border border-[var(--color-secondary)]/20 shadow-sm md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📝</span>
                  <span className="font-medium text-[var(--color-primary)]">Gender Description</span>
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {eligibilityModule.genderDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Check Button */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-primary)]/20">
          {patientProfile ? (
            <button
              onClick={handleFilterPatients}
              disabled={filtering}
              className="btn-primary btn-enhanced text-base px-8 py-4 w-full md:w-auto shadow-brand hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              {filtering ? (
                <>
                  <div className="loading-shimmer w-5 h-5 rounded-full"></div>
                  Checking Eligibility...
                </>
              ) : (
                <>
                  <span className="text-xl">🔍</span>
                  Check My Eligibility
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-[var(--color-danger)]/10 rounded-lg border border-[var(--color-danger)]/20">
              <span className="text-xl">⚠️</span>
              <p className="text-[var(--color-danger)] font-medium">
                No patient selected. Please provide a UUID in the URL to check eligibility.
              </p>
            </div>
          )}
        </div>
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
