'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Eligibility criteria structure
interface EligibilityModule {
  eligibilityCriteria: string;
  healthyVolunteers: boolean;
  sex: 'FEMALE' | 'MALE' | 'ALL';
  genderBased: boolean;
  genderDescription: string;
  minimumAge: string;
  maximumAge: string;
}

// Sponsor contact structure
interface Sponsor {
  name?: string;
  class?: string;
}

// Contact structure
interface Contact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

// Protocol section structure
interface ProtocolSection {
  identificationModule: {
    nctId: string;
    briefTitle: string;
    officialTitle: string;
    organization: { fullName: string };
  };
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

// Study structure
interface Study {
  protocolSection: ProtocolSection;
}

// Patient result
interface PatientResult {
  name: string;
  eligible: boolean;
  explanation: string;
}

export default function TrialPage() {
  const router = useRouter();
  const params = useParams();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [results, setResults] = useState<PatientResult[]>([]);
  const [patientCount, setPatientCount] = useState<number>(5);

  // Fetch study
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!study) return <p className="text-center mt-10">Study not found.</p>;

  const { protocolSection } = study;
  const { identificationModule, statusModule, eligibilityModule, sponsorCollaboratorsModule, contactsLocationsModule, moreInfoModule } = protocolSection;

  // Flatten sponsors
  const sponsors = [
    sponsorCollaboratorsModule?.leadSponsor,
    ...(sponsorCollaboratorsModule?.collaborators || []),
  ].filter(Boolean);

  // Flatten contacts
  const contacts: Contact[] = [];
  contactsLocationsModule?.centralContacts?.forEach(c => contacts.push(c));
  contactsLocationsModule?.locations?.forEach(loc => loc.contacts?.forEach(c => contacts.push(c)));
  if (moreInfoModule?.pointOfContact) contacts.push(moreInfoModule.pointOfContact);

  // Patient filtering
  const handleFilterPatients = async () => {
    setFiltering(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const patientFile = urlParams.get("patientFile"); // path to patient's XML file
      console.log("Patient file:", patientFile);

      const responses: PatientResult[] = [];
      const eligibilityStr = JSON.stringify(eligibilityModule);

      if (patientFile) {
        // Patient mode: use specific file
        const res = await fetch("/api/filterPatients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eligibilityCriteria: eligibilityStr,
            filePath: patientFile, // send filePath instead of XML content
          }),
        });
        const data = await res.json();
        responses.push({
          name: "You",
          eligible: data.eligible,
          explanation: data.explanation || "Unable to filter patient",
        });
      } else {
        // Sponsor mode: fetch multiple patients from folder
        const patientsRes = await fetch(`/api/patients?count=${patientCount}`);
        const { patients } = await patientsRes.json();

        for (const p of patients) {
          const res = await fetch("/api/filterPatients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eligibilityCriteria: eligibilityStr,
              filePath: p.filePath, // use relative file path
            }),
          });
          const data = await res.json();
          responses.push({
            name: p.name,
            eligible: data.eligible,
            explanation: data.explanation || "Unable to filter patient",
          });
        }
      }

      setResults(responses);
    } catch (err) {
      console.error("Error filtering patients:", err);
    } finally {
      setFiltering(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const patientFile = urlParams.get("patientFile"); // path to patient's XML file
  const backUrl = patientFile ? "/patient" : "/sponsor";

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <button
        onClick={() => router.push(backUrl)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        ← Back to Search
      </button>

      {/* Study Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{identificationModule.briefTitle}</h1>
        <p className="text-gray-700 italic">{identificationModule.officialTitle}</p>
        <p className="text-sm text-gray-500">Sponsor: {sponsors?.[0]?.name || 'N/A'}</p>
        <p className="text-sm text-gray-500">
          Status: <span className="font-semibold">{statusModule.overallStatus}</span>
        </p>
        <p className="text-sm text-gray-500">
          Start Date: {statusModule.startDate || 'N/A'} | Completion Date: {statusModule.completionDate || 'N/A'}
        </p>
      </div>

      <hr />

      {/* Eligibility */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-1">Eligibility Criteria</h2>

        {/* Full criteria text */}
        <pre className="whitespace-pre-line bg-gray-50 p-4 rounded shadow-sm text-gray-800">
          {eligibilityModule.eligibilityCriteria || 'No eligibility information available.'}
        </pre>

        {/* Structured eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Healthy Volunteers:</span> {eligibilityModule.healthyVolunteers ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Sex:</span> {eligibilityModule.sex}
          </div>
          <div>
            <span className="font-medium">Gender Based:</span> {eligibilityModule.genderBased ? 'Yes' : 'No'}
          </div>
          {eligibilityModule.genderDescription && (
            <div className="md:col-span-2">
              <span className="font-medium">Gender Description:</span> {eligibilityModule.genderDescription}
            </div>
          )}
          <div>
            <span className="font-medium">Minimum Age:</span> {eligibilityModule.minimumAge || 'Not specified'}
          </div>
          <div>
            <span className="font-medium">Maximum Age:</span> {eligibilityModule.maximumAge || 'Not specified'}
          </div>
        </div>

        {/* Number of patients to filter */}
        {patientFile ? null :
          <div className="flex items-center space-x-2">
            <label htmlFor="patientCount" className="text-sm font-medium">Number of patients to check:</label>
            <input
              type="number"
              id="patientCount"
              value={patientCount}
              onChange={(e) => setPatientCount(Number(e.target.value))}
              min={1}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        }
        {/* Filter patients button */}
        <button
          onClick={handleFilterPatients}
          disabled={filtering}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {filtering ? 'Checking Patients...' : 'Check Patient Eligibility'}
        </button>
      </div>

      {/* Patient Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Patient Results</h3>
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Patient</th>
                <th className="border px-4 py-2 text-left">Eligible</th>
                <th className="border px-4 py-2 text-left">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.name}>
                  <td className="border px-4 py-2">{r.name}</td>
                  <td className="border px-4 py-2">
                    {r.eligible ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-600 font-semibold">No</span>}
                  </td>
                  <td className="border px-4 py-2">{r.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Contacts</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {contacts.map((c, i) => (
              <li key={i}>
                {c.name} ({c.role})
                {c.email && ` - ${c.email}`}
                {c.phone && ` - ${c.phone}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
