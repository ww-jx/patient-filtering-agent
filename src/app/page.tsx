'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EmailAuthForm from '@/components/AuthForm';

export default function HomePage() {
  // Simplified landing page only. No post-subscription transition.

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
                  <span className="block text-slate-900">Weekly medical news</span>
                  <span className="block text-gradient">
                  personalized for your condition
                  </span>
                </h1>

                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                Every email is made specifically for your health condition. We curate the latest medical papers, treatment advances, clinical trials that are actually relevant to you. 
                </p>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                Personalized health news, delivered once a week to your inbox.
                </p>

                <div className="mt-6 sm:mt-8 space-y-4">
                  <div className="w-full">
                    <EmailAuthForm />
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
                      Weekly • Free • No spam, unsubscribe anytime
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

              {/* Newsletter Digest Preview */}
              <div className="relative">
                <div className="absolute -inset-6 blur-3xl opacity-25 bg-gradient-to-tr from-orange-300/30 via-amber-300/30 to-yellow-300/20 rounded-3xl"></div>
                
                {/* Magic Giraffe Mascot positioned above the window */}
                <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="animate-float">
                    <Image
                      src="/giraffe.webp"
                      alt="Magic Giraffe delivering your weekly brief"
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
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* PubMed Highlights */}
                    <div className="bg-orange-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500">📰</span>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium">This week on PubMed</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>GLP‑1 therapies and cardiovascular outcomes in Type 2 Diabetes — systematic review</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Long‑acting bronchodilators in COPD: real‑world exacerbation reduction study</span>
                        </li>
                      </ul>
                    </div>

                    {/* Trials Highlights */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-amber-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500">🧪</span>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium">New clinical trials for Rheumatoid Arthritis</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-slate-800">JAK inhibitor vs. Methotrexate — flare prevention</span>
                          <span className="status-badge status-recruiting text-xs">Recruiting</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-slate-800">Biologic tapering strategy in sustained remission</span>
                          <span className="status-badge status-enrolling text-xs">Enrolling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 sm:mt-3 text-xs text-slate-500 text-center font-medium px-4">Curated summaries • Chronic condition focus • Private by design</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-cool">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Stay ahead with a 3‑minute weekly brief</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              We scan PubMed and ClinicalTrials.gov and send you the most relevant updates for your condition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">1</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Tell us your condition</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Focus on chronic illnesses like Diabetes, COPD, RA, CKD, MS</p>
            </div>
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">2</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Get a weekly digest</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Clear summaries of new studies and trials — right in your inbox</p>
            </div>
            <div className="text-center surface rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-black grid place-content-center font-bold text-lg sm:text-xl mx-auto mb-3 sm:mb-4 shadow-brand">3</div>
              <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg">Explore what’s relevant</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Dive deeper when something looks promising for you and your care</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">11,000,000+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Journals Scanned</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">553,000+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Trials Tracked</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-primary">870+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Health Conditions Monitored</div>
            </div>
            <div className="marketing-card p-4 sm:p-6 surface-hover">
              <div className="text-2xl sm:text-3xl font-bold text-slate-700">Weekly</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Delivered Every Friday</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
