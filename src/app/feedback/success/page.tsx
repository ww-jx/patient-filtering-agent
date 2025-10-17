import React from 'react';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 mx-auto mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    style={{ color: 'var(--color-success)' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function FeedbackPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-warm p-4">
      <div className="marketing-card w-full max-w-md p-8 md:p-12 text-center animate-fadeInUp">

        <CheckIcon />

        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4 text-heading">
          Thank You!
        </h1>

        <p className="text-readable text-muted mb-8">
          Your feedback has been successfully recorded. We appreciate you helping us
          improve your weekly research digest.
        </p>

      </div>
    </main>
  );
}
