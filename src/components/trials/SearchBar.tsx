import { Search } from "lucide-react";

export function SearchBar({ keywords, setKeywords, onSearch }: {
  keywords: string;
  setKeywords: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder="Enter keyword or NCT ID"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full border rounded-lg p-3 pl-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
    </div>
  );
}
