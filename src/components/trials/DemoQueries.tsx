'use client';

interface DemoQueriesProps {
  queries: string[];
  setKeywords: (val: string) => void;
}

export const DemoQueries = ({ queries, setKeywords }: DemoQueriesProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mx-auto">
      {queries.map((q, index) => (
        <button
          key={q}
          onClick={() => setKeywords(q)}
          className="relative group bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 hover:text-primary transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-fadeInUp"
          style={{ 
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'both'
          }}
        >
          <span className="relative z-10">{q}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      ))}
    </div>
  );
};
