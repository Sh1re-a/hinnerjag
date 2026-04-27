import { useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { LocateFixed } from "lucide-react";
import { inputClass, metaText, sectionLabel, smallText } from "./uiTokens";

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
        <div className="pt-2.5">
          <p className={sectionLabel}>HINNER JAG</p>
        </div>

        <div className="flex-1">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-1">
            <input
              className={inputClass}
              placeholder="Sök adress eller plats..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {isLoading && (
        <div className="mt-1 text-xs text-white/60">Söker…</div>
      )}
      {results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-3xl border border-white/10 bg-[#1a2230] p-2">
          {results.map((r) => (
            <li key={r.label} className="list-none">
              <button
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5"
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

      <header className="mt-2.5 flex items-center gap-2 sm:mt-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300 backdrop-blur">
          <LocateFixed size={14} />
        </div>
        <div className="min-w-0">
          <p className={metaText}>Aktiv plats</p>
          <p className={`mt-1 truncate ${smallText}`}>{addressLabel}</p>
        </div>
      </header>
    </>
  );
}
