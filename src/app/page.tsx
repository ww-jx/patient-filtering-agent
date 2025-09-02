'use client';

import { useState, useEffect } from 'react';
import type { PatientProfile } from '@/lib/types';
import EmailAuthForm from '@/components/AuthForm';
import PatientHome from '@/components/PatientHome';
import { UpdateProfile } from '@/components/UpdateProfile';

export default function HomePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const handleLogout = () => {
    setProfile(null);
    setOtpVerified(false);
    localStorage.removeItem('patientProfile');
  };

  const handleSuccess = (profile: PatientProfile) => {
    setProfile(profile);
    setOtpVerified(true);
    localStorage.setItem('patientProfile', JSON.stringify(profile));
  };

  useEffect(() => {
    const stored = localStorage.getItem('patientProfile');
    if (stored) {
      setProfile(JSON.parse(stored));
      setOtpVerified(true);
    }
  }, []);

  if (profile && otpVerified) {
    return (
      <div className="flex flex-col items-center justify-start px-4 sm:px-6 md:px-12 py-6 bg-background text-foreground w-full relative">
        {/* Buttons row */}
        <div className="flex w-full max-w-5xl justify-between items-center mb-4">
          <button
            onClick={() => setShowUpdate(true)}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-danger text-white rounded hover:bg-danger-hover"
          >
            Log Out
          </button>
        </div>

        {/* Main content */}
        <div className="w-full max-w-5xl">
          <PatientHome profile={profile} />
        </div>

        {showUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-20"
              onClick={() => setShowUpdate(false)}
            />

            <div className="relative bg-background w-full max-w-lg p-6 rounded-lg shadow-xl z-10">
              <button
                onClick={() => setShowUpdate(false)}
                className="absolute top-3 right-3 text-xl font-bold text-foreground"
              >
                ×
              </button>

              <UpdateProfile
                profile={profile}
                onUpdate={(updatedProfile) => {
                  setProfile(updatedProfile);
                  localStorage.setItem('patientProfile', JSON.stringify(updatedProfile));
                  setShowUpdate(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 space-y-10 bg-background text-foreground">
      <h1 className="text-4xl font-bold text-center">Clinical Trials Finder</h1>
      <p>Enter your email to get started</p>
      <EmailAuthForm onSuccess={handleSuccess} />
    </div>
  );
}
