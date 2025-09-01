'use client';

import { useState, useEffect } from "react";
import UserProfileForm from "@/components/SignUpForm";
import SignInForm from "@/components/SignInForm";
import PatientPageWrapper from "./patient/page";
import type { PatientProfile } from "@/lib/types";

export default function HomePage() {
  const [mode, setMode] = useState<"signup" | "signin" | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  const handleSuccess = (profile: PatientProfile) => {
    setProfile(profile);
    localStorage.setItem("patientProfile", JSON.stringify(profile)); // persist
  };

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem("patientProfile");
    setMode(null); // go back to signup/signin
  };

  const handleBack = () => {
    setMode(null); // back to default homepage
  };

  useEffect(() => {
    const stored = localStorage.getItem("patientProfile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  if (profile)
    return (
      <div className="flex flex-col min-h-screen items-center justify-start p-8 space-y-6">
        <div className="self-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
        <PatientPageWrapper profile={profile} />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 space-y-10 text-slate-900">
      {!mode && (
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-semibold">Get started</h2>
          <div className="flex space-x-6">
            <button
              onClick={() => setMode("signup")}
              className="px-6 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 transition"
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode("signin")}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div className="w-full max-w-lg">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Back
          </button>
          <UserProfileForm onProfileCreated={handleSuccess} />
        </div>
      )}

      {mode === "signin" && (
        <div className="w-full max-w-lg">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Back
          </button>
          <SignInForm onSignIn={handleSuccess} />
        </div>
      )}
    </div>
  );
}
