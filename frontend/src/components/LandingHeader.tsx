import { useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { LocateFixed } from "lucide-react";
import { inputClass, sectionLabel } from "./uiTokens";

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
      <nav className="flex items-start justify-between gap-3">
        <p className={`${sectionLabel} pt-3`}>
          HINNER JAG
        </p>
        <div className="flex-1">
          <input
            className={inputClass}
            placeholder="Sök adress eller plats..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </nav>
      {isLoading && (
        <div className="mt-1 text-xs text-white/60">Söker…</div>
      )}
      {results.length > 0 && (
        <ul className="menu mt-2 rounded-2xl border border-white/10 bg-[#1a2230] p-2">
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
