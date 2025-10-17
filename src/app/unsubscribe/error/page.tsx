import React from 'react';

const XCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 mx-auto mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    style={{ color: 'var(--color-error)' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function UnsubscribeErrorPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-warm p-4">
      <div className="marketing-card w-full max-w-md p-8 md:p-12 text-center animate-fadeInUp">

        <XCircleIcon />

        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4 text-heading">
          Unsubscribe Failed
        </h1>

        <p className="text-readable text-muted mb-8">
          We encountered an issue trying to unsubscribe you. Please try again or contact our support team if the problem persists.
        </p>


      </div>
    </main>
  );
}
