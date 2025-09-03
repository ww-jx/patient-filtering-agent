'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="relative z-10 border-b border-slate-800/50 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3 font-semibold">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-sm">
                  <Image
                    src="/giraffe.webp"
                    alt="TrialFinder Giraffe Mascot"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-primary text-sm sm:text-base">GiraffeGuru TrialFinder</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowUpdate(true)}
                  className="bg-primary hover:bg-primary-hover text-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 active:scale-95"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-slate-100"
                >
                  Log Out
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main id="main" className="relative">
          <PatientHome profile={profile} />
        </main>

        {/* Enhanced Modal */}
        {showUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setShowUpdate(false)}
            />
            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-xl-soft border border-orange-200/30 overflow-hidden modal-mobile max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-orange-200/30">
                <h2 className="text-xl font-semibold text-primary">Update Profile</h2>
                <button
                  onClick={() => setShowUpdate(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 text-muted hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
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
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="antialiased text-slate-800 bg-white min-h-screen">
      {/* Header */}
      

      {/* HERO Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warm-50 via-white to-brand-50">
        <div className="absolute inset-0 bg-aurora animate-gradient"></div>
        <div className="absolute inset-0 col-grid text-slate-400"></div>
        


        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Hero Copy */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  <span className="block text-slate-900">Discover clinical trials</span>
                  <span className="block text-gradient">
                    tailored to your condition
                  </span>
                </h1>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                  Connect with breakthrough treatments and cutting-edge research studies. 
                  Our intelligent matching system helps you find relevant clinical trials based on your medical profile and location.
                </p>

                <div className="mt-6 sm:mt-8 space-y-4">
                  <div className="w-full">
                    <EmailAuthForm onSuccess={handleSuccess} />
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
                      Free to use • Trusted by patients nationwide
                    </span>
                    <br></br>
                    <br></br>
                    <br></br>
                  </div>
                </div>

                {/* Trust bar */}
                {/* <div className="mt-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src="/giraffe.webp"
                      alt="Giraffe mascot"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    <p className="text-sm font-semibold text-slate-700">Trusted by leading medical institutions</p>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                        <span className="text-white text-xs">🛡️</span>
                      </div>
                      <span className="text-sm font-medium">Mayo Clinic Platform</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 rounded bg-medical-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium">JAMA Network</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                        <span className="text-white text-xs">📊</span>
                      </div>
                      <span className="text-sm font-medium">NEJM</span>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Clinical Trials Interface Preview */}
              <div className="relative">
                <div className="absolute -inset-6 blur-3xl opacity-25 bg-gradient-to-tr from-orange-300/30 via-amber-300/30 to-yellow-300/20 rounded-3xl"></div>
                
                {/* Magic Giraffe Mascot positioned above the window */}
                <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="animate-float">
                    <Image
                      src="/giraffe.webp"
                      alt="Magic Giraffe creating search results"
                      width={120}
                      height={120}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 drop-shadow-2xl"
                    />
                  </div>
                </div>

                <div className="relative rounded-3xl marketing-card shadow-xl-soft ring-1 ring-orange-200/40 overflow-hidden">
                  <div className="p-5 border-b border-orange-200/60">
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Search Interface */}
                                        <div className="bg-orange-50/80 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400">🔍</div>
                        <span className="text-xs sm:text-sm text-slate-600">Search by condition, location, or study type</span>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-orange-200/50 shadow-sm">
                        <span className="text-sm sm:text-base text-slate-800 font-medium">Type 2 Diabetes</span>
                      </div>
                    </div>
                    
                    {/* Results Preview */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-orange-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
                          <h4 className="font-semibold text-slate-800 text-xs sm:text-sm leading-tight">Novel Insulin Treatment Study</h4>
                          <span className="status-badge status-recruiting text-xs self-start">Recruiting</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">Phase III trial for new long-acting insulin therapy</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">📍 Boston, MA</span>
                          <span className="flex items-center gap-1">⏱️ 6 months</span>
                          <span className="flex items-center gap-1">👥 Ages 18-65</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-amber-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
                          <h4 className="font-semibold text-slate-800 text-xs sm:text-sm leading-tight">Continuous Glucose Monitor Study</h4>
                          <span className="status-badge status-enrolling text-xs self-start">Enrolling</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">Evaluating next-gen CGM technology</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">📍 New York, NY</span>
                          <span className="flex items-center gap-1">⏱️ 3 months</span>
                          <span className="flex items-center gap-1">👥 Ages 21-70</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 sm:mt-3 text-xs text-slate-500 text-center font-medium px-4">Real-time matching • Personalized recommendations • Secure & private</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-cool">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Finding the right trial is simple with GiraffeGuru</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Our intelligent matching system connects you with relevant clinical trials in three easy steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">1</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Share your medical condition</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Tell us about your health condition and location preferences</p>
            </div>
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">2</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Get matched instantly</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Our AI finds relevant trials based on your profile</p>
            </div>
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">3</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Connect with research teams</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Direct contact with clinical trial coordinators</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">15+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Patients Connected</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">25,000+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Active Trials</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-primary">150+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Research Centers</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-slate-700">90%</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Match Accuracy</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
