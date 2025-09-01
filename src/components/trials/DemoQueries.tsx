'use client';

interface DemoQueriesProps {
  queries: string[];
  setKeywords: (val: string) => void;
}

export const DemoQueries = ({ queries, setKeywords }: DemoQueriesProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {queries.map(q => (
        <button
          key={q}
          onClick={() => {
            setKeywords(q);
          }}
          className="px-4 py-2 bg-white border rounded-lg text-slate-700 hover:bg-slate-100 transition"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
