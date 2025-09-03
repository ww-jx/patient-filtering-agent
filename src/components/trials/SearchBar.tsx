import { Search, Loader2 } from "lucide-react";

export function SearchBar({
  keywords,
  setKeywords,
  onSearch,
  loading = false,
}: {
  keywords: string;
  setKeywords: (v: string) => void;
  onSearch: () => void;
  loading?: boolean;
}) {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by condition, location"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full h-14 sm:h-16 border-0 rounded-2xl px-6 pl-14 sm:pl-16 pr-20 bg-white/95 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-lg backdrop-blur-sm transition-all duration-300 text-base sm:text-lg font-medium hover:bg-white focus:bg-white"
        />

        <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-primary" />
          ) : (
            <Search className="h-6 w-6 sm:h-7 sm:w-7 text-slate-400" />
          )}
        </div>

        <button
          onClick={() => !loading && onSearch()}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 text-sm sm:text-base"
          title="Search for clinical trials"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-60"></div>
    </div>
  );
}
