import { useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { LocateFixed } from "lucide-react";

type LandingHeaderProps = {
  addressLabel: string;
  onSelectAddress?: (lat: number, lng: number, label: string) => void;
};

export function LandingHeader({
  addressLabel,
  onSelectAddress,
}: LandingHeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { label: string; lat: number; lng: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const res = await searchAddress(value);
    setResults(res);
    setIsLoading(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
          HINNER JAG
        </p>
        <input
          className="input input-bordered bg-white/5 text-white placeholder:text-white/35 px-3 py-1.5 text-[11px] font-medium"
          placeholder="Search address…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </nav>
      {isLoading && (
        <div className="text-xs text-white/60 mt-1">Searching…</div>
      )}
      {results.length > 0 && (
        <ul className="menu mt-1 rounded-box border border-white/10 bg-white/5 p-2">
          {results.map((r) => (
            <li key={r.label}>
              <button
                className="text-left text-white/85"
                onClick={() => {
                  setQuery(r.label);
                  setResults([]);
                  onSelectAddress?.(r.lat, r.lng, r.label);
                }}
                type="button"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <header className="mt-2.5 flex items-center gap-2.5 sm:mt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300 backdrop-blur">
          <LocateFixed size={15} />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="truncate text-[11px] text-white/56">{addressLabel}</p>
        </div>
      </header>
    </>
  );
}
