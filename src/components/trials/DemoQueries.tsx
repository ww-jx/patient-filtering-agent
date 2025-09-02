'use client';

interface DemoQueriesProps {
  queries: string[];
  setKeywords: (val: string) => void;
}

export const DemoQueries = ({ queries, setKeywords }: DemoQueriesProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-2xl">
      {queries.map((q) => (
        <button
          key={q}
          onClick={() => setKeywords(q)}
          className="btn-primary w-full py-2 px-3 rounded-lg text-sm font-medium hover:bg-secondary-hover transition"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
