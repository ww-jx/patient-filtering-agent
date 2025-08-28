'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 space-y-10 text-slate-900">
      <h1 className="text-4xl font-bold text-center">ClinicalTrials Eligibility Agent</h1>

      <div className="flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-semibold">I am a...</h2>
        <div className="flex space-x-6">
          <Link href="/patient" className="no-underline">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition">
              Patient
            </button>
          </Link>
          <Link href="/sponsor" className="no-underline">
            <button className="px-6 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 transition">
              Sponsor
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
