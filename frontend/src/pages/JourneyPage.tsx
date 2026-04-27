import { useEffect, useMemo, useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { useJourneyPlan } from "../hooks/useJourneyPlan";
import type { JourneyPlanRequest } from "../hooks/useJourneyPlan";
import { JourneyResults } from "../components/JourneyResults";
import { JourneyDetail } from "../components/JourneyDetail";
import { ArrowLeft, LocateFixed, Search } from "lucide-react";
import JourneySummaryCard from "../components/JourneySummaryCard";
import { OuterCard } from "../components/CardBase";
import {
  ctaClass,
  ghostButton,
  heroTitle,
  iconButton,
  iconSize,
  inputClass,
  sectionLabel,
  subtleButton,
} from "../components/uiTokens";

type Address = { label: string; lat: number; lng: number };

type JourneyPageProps = {
  onBack?: () => void;
  originPreset?: Address | null;
  onSelectOrigin?: (origin: Address) => void;
  onRequestCurrentPosition?: () => Promise<{ lat: number; lng: number }>;
  isLocating?: boolean;
};

export function JourneyPage({
  onBack,
  originPreset = null,
  onSelectOrigin,
  onRequestCurrentPosition,
  isLocating = false,
}: JourneyPageProps) {
  const [origin, setOrigin] = useState<Address | null>(null);
  const [manualOriginMode, setManualOriginMode] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [originResults, setOriginResults] = useState<Address[]>([]);

  const [destination, setDestination] = useState<Address | null>(null);
  const [destQuery, setDestQuery] = useState("");
  const [destResults, setDestResults] = useState<Address[]>([]);

  const plan = useJourneyPlan();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  useEffect(() => {
    if (originPreset && !manualOriginMode) {
      setOrigin(originPreset);
      setOriginQuery(originPreset.label);
    }
  }, [originPreset, manualOriginMode]);

  const canSubmit = Boolean(origin && destination && !plan.isPending);
  const resultTitle = useMemo(() => {
    if (destination?.label) return destination.label;
    if (destQuery) return destQuery;
    return "Din resa";
  }, [destination?.label, destQuery]);

  const handleOriginSearch = async (q: string) => {
    setOriginQuery(q);
    if (q.length < 2) {
      setOriginResults([]);
      return;
    }

    try {
      const res = await searchAddress(q);
      setOriginResults(res);
    } catch {
      setOriginResults([]);
    }
  };

  const handleDestSearch = async (q: string) => {
    setDestQuery(q);
    if (q.length < 2) {
      setDestResults([]);
      return;
    }

    try {
      const res = await searchAddress(q);
      setDestResults(res);
    } catch {
      setDestResults([]);
    }
  };
  const handlePlan = () => {
    if (!origin || !destination) return;

    const req: JourneyPlanRequest = {
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    };

    setSelectedSegment(null);
    plan.mutate(req);
  };

  const syncOrigin = (nextOrigin: Address) => {
    setOrigin(nextOrigin);
    setOriginQuery(nextOrigin.label);
    onSelectOrigin?.(nextOrigin);
  };

  const handleUseCurrentPosition = async () => {
    if (!onRequestCurrentPosition) return;

    try {
      const nextPosition = await onRequestCurrentPosition();
      const nextOrigin = {
        label: `${nextPosition.lat.toFixed(5)}, ${nextPosition.lng.toFixed(5)}`,
        lat: nextPosition.lat,
        lng: nextPosition.lng,
      };
      syncOrigin(nextOrigin);
      setManualOriginMode(false);
    } catch {
      // The location hook already owns user-facing error handling.
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-14 pt-4 text-white sm:max-w-3xl">
      <header className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={sectionLabel}>Resplanerare</p>
            <h2 className={heroTitle}>Planera din resa</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">Se om du hinner innan du går.</p>
          </div>

          {onBack && (
            <button type="button" onClick={onBack} className={ghostButton}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka
            </button>
          )}
        </div>
      </header>

      <OuterCard>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/45">Från</label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-2">
                {manualOriginMode ? (
                  <div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        value={originQuery}
                        onChange={(e) => void handleOriginSearch(e.target.value)}
                        placeholder="Sök adress eller plats..."
                        className={`${inputClass} pl-11`}
                      />
                    </div>

                    {originResults.length > 0 && (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#1a2230]">
                        {originResults.map((result) => (
                          <button
                            key={result.label}
                            className="block w-full border-b border-white/6 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5"
                            onClick={() => {
                              syncOrigin(result);
                              setOriginResults([]);
                              setManualOriginMode(false);
                            }}
                            type="button"
                          >
                            {result.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${inputClass} flex min-h-14 items-center`}>
                    <span className="truncate">{origin?.label ?? "Ingen position vald"}</span>
                  </div>
                )}
                <div className="text-sm text-white/45">
                  {origin ? "Utgår från din nuvarande plats" : "Sätt startpunkt manuellt eller via position"}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setManualOriginMode((current) => !current)}
                  className={subtleButton}
                >
                  {manualOriginMode ? "Klar" : "Ändra"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleUseCurrentPosition();
                  }}
                  className={iconButton}
                  disabled={isLocating}
                  aria-label="Använd min position"
                >
                  <LocateFixed className={iconSize} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/45">Till</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={destQuery}
                onChange={(e) => void handleDestSearch(e.target.value)}
                placeholder="Sök destination..."
                className={`${inputClass} pl-11`}
              />
            </div>

            {destResults.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#1a2230]">
                {destResults.map((result) => (
                  <button
                    key={result.label}
                    className="block w-full border-b border-white/6 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5"
                    onClick={() => {
                      setDestination(result);
                      setDestResults([]);
                      setDestQuery(result.label);
                    }}
                    type="button"
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlan}
              disabled={!canSubmit}
              className={`${ctaClass} disabled:cursor-not-allowed disabled:opacity-45`}
              type="button"
            >
              {plan.isPending ? "Planerar…" : "Visa resor"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOrigin(originPreset);
                setDestination(null);
                setOriginQuery(originPreset?.label ?? "");
                setDestQuery("");
                setOriginResults([]);
                setDestResults([]);
                setManualOriginMode(false);
                setSelectedSegment(null);
                plan.reset();
              }}
              className={ghostButton}
            >
              Rensa
            </button>
          </div>
        </div>
      </OuterCard>

      {plan.isError && (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {(plan.error as Error)?.message ?? "Fel vid planering"}
        </div>
      )}

      {plan.data && (
        <div className="mt-5">
          <JourneySummaryCard data={plan.data} />

          <JourneyResults
            data={plan.data}
            onSelectSegment={(index) => setSelectedSegment(index)}
            selectedIndex={selectedSegment}
          />

          {selectedSegment !== null && (
            <JourneyDetail
              data={plan.data}
              segmentIndex={selectedSegment}
              originLabel={origin?.label}
              destinationLabel={resultTitle}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default JourneyPage;
