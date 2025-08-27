'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// eligibility criteria structure
interface EligibilityModule {
  eligibilityCriteria: string;
  healthyVolunteers: boolean;
  sex: 'FEMALE' | 'MALE' | 'ALL';
  genderBased: boolean;
  genderDescription: string;
  minimumAge: string;
  maximumAge: string;
  stdAges: ('CHILD' | 'ADULT' | 'OLDER_ADULT')[];
  studyPopulation: string;
  samplingMethod: 'PROBABILITY_SAMPLE' | 'NON_PROBABILITY_SAMPLE';
}

// clinical trial structure
interface Study {
  protocolSection: {
    identificationModule: {
      briefTitle: string;
      officialTitle: string;
      organization: { fullName: string };
    };
    statusModule: {
      overallStatus: string;
      startDateStruct: { date: string };
      completionDateStruct: { date: string };
    };
    eligibilityModule: EligibilityModule;
  };
}

// patient filtering result
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

  const { identificationModule, statusModule, eligibilityModule } = study.protocolSection;

  // patient filtering
  const handleFilterPatients = async () => {
    setFiltering(true);
    try {
      const patientsRes = await fetch(`/api/patients?count=${patientCount}`);
      const { patients } = await patientsRes.json();

      const responses: PatientResult[] = [];

      for (const p of patients) {
        const res = await fetch("/api/filterPatients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eligibilityCriteria: eligibilityModule,
            patientData: p.xml,
          }),
        });

        const data = await res.json();
        responses.push({
          name: p.name,
          eligible: data.eligible,
          explanation: data.explanation || 'Unable to filter patient',
        });
      }

      setResults(responses);
    } catch (err) {
      console.error("Error filtering patients:", err);
    } finally {
      setFiltering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <button
        onClick={() => router.push('/')}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        ← Back to Search
      </button>

      {/* Study Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{identificationModule.briefTitle}</h1>
        <p className="text-gray-700 italic">{identificationModule.officialTitle}</p>
        <p className="text-sm text-gray-500">Sponsor: {identificationModule.organization.fullName}</p>
        <p className="text-sm text-gray-500">
          Status: <span className="font-semibold">{statusModule.overallStatus}</span>
        </p>
        <p className="text-sm text-gray-500">
          Start Date: {statusModule.startDateStruct.date} | Completion Date: {statusModule.completionDateStruct.date}
        </p>
      </div>

      <hr />

      {/* eligibility */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-1">Eligibility Criteria</h2>

        <pre className="whitespace-pre-line bg-gray-50 p-4 rounded shadow-sm text-gray-800">
          {eligibilityModule.eligibilityCriteria}
        </pre>

        {/* num of patients to filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="patientCount" className="text-sm font-medium">
            Number of patients to check:
          </label>
          <input
            type="number"
            id="patientCount"
            value={patientCount}
            onChange={(e) => setPatientCount(Number(e.target.value))}
            min="1"
            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* filter patients btn */}
        <button
          onClick={handleFilterPatients}
          disabled={filtering}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {filtering ? 'Checking Patients...' : 'Check Patient Eligibility'}
        </button>

        {/* patient results */}
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
                      {r.eligible ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-red-600 font-semibold">No</span>
                      )}
                    </td>
                    <td className="border px-4 py-2">{r.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
