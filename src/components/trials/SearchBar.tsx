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
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder="Click the icon or press Enter to search"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full h-8 md:h-10 lg:h-12 border border-muted rounded-lg p-3 pl-10 bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <span
        onClick={() => !loading && onSearch()}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-muted hover:text-primary"
        title="Press Enter or click to search"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </span>
    </div>
  );
}
