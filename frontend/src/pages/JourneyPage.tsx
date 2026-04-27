import { useEffect, useMemo, useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { useJourneyPlan } from "../hooks/useJourneyPlan";
import type { JourneyPlanRequest, JourneyTrip } from "../hooks/useJourneyPlan";
import { JourneyResults } from "../components/JourneyResults";
import { JourneyDetail } from "../components/JourneyDetail";
import { LocateFixed, Search } from "lucide-react";
import JourneySummaryCard from "../components/JourneySummaryCard";
import { OuterCard } from "../components/CardBase";
import { getJourneyHeader } from "../lib/journeyUi";
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
  const [showPlanner, setShowPlanner] = useState(true);

  const plan = useJourneyPlan();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<"plan" | "detail">("plan");

  useEffect(() => {
    if (originPreset && !manualOriginMode) {
      setOrigin(originPreset);
      setOriginQuery(originPreset.label);
    }
  }, [originPreset, manualOriginMode]);

  useEffect(() => {
    setSelectedOptionIndex(0);
    setSelectedSegment(null);
    setCurrentScreen("plan");
  }, [plan.data]);

  const canSubmit = Boolean(origin && destination && !plan.isPending);
  const originDisplayLabel = useMemo(() => {
    if (!origin?.label) return "Ingen position vald";
    return /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(origin.label)
      ? "Din plats"
      : origin.label;
  }, [origin?.label]);
  const resultTitle = useMemo(() => {
    if (destination?.label) return destination.label;
    if (destQuery) return destQuery;
    return "Din resa";
  }, [destination?.label, destQuery]);
  const tripOptions = useMemo<JourneyTrip[]>(() => {
    if (!plan.data) return [];
    if (plan.data.options && plan.data.options.length > 0) {
      return plan.data.options;
    }
    return [plan.data];
  }, [plan.data]);
  const activeTrip = tripOptions[selectedOptionIndex] ?? tripOptions[0] ?? null;
  const journeyHeader = useMemo(() => {
    if (!activeTrip) return null;
    return getJourneyHeader(activeTrip, origin?.label, resultTitle);
  }, [activeTrip, origin?.label, resultTitle]);

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
    setSelectedOptionIndex(0);
    setShowPlanner(false);
    setCurrentScreen("plan");
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
    <div className="mx-auto max-w-md px-1 pb-12 pt-1 text-white sm:max-w-3xl">
      {currentScreen === "detail" && activeTrip ? (
        <>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className={sectionLabel}>Detaljerad resväg</div>
            <button
              type="button"
              onClick={() => setCurrentScreen("plan")}
              className={ghostButton}
            >
              Tillbaka
            </button>
          </div>

          <JourneyDetail
            data={activeTrip}
            segmentIndex={selectedSegment ?? 0}
            originLabel={origin?.label}
            destinationLabel={resultTitle}
          />
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between px-1">
            <div className={sectionLabel}>Reseplanerare</div>
            {onBack && (
              <button type="button" onClick={onBack} className={ghostButton}>
                Tillbaka
              </button>
            )}
          </div>

      <OuterCard>
        {plan.data && !showPlanner ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={sectionLabel}>Plan</div>
              <div className="mt-1 truncate text-[14px] font-medium text-white">
                {originDisplayLabel} → {resultTitle}
              </div>
            </div>
            <button type="button" className={subtleButton} onClick={() => setShowPlanner(true)}>
              Ändra resa
            </button>
          </div>
        ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">Från</label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-2">
                {manualOriginMode ? (
                  <div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        value={originQuery}
                        onChange={(e) => void handleOriginSearch(e.target.value)}
                        placeholder="Sök adress eller plats..."
                        className={`${inputClass} pl-10`}
                      />
                    </div>

                    {originResults.length > 0 && (
                      <div className="mt-2 overflow-hidden rounded-md border border-white/8 bg-[#1a2230]">
                        {originResults.map((result) => (
                          <button
                            key={result.label}
                            className="block w-full border-b border-white/6 px-3 py-2.5 text-left text-[13px] text-white/82 transition last:border-b-0 hover:bg-white/5"
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
                  <div className={`${inputClass} flex min-h-11 items-center`}>
                    <span className="truncate">{originDisplayLabel}</span>
                  </div>
                )}
                <div className="text-[12px] text-white/45">
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">Till</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={destQuery}
                onChange={(e) => void handleDestSearch(e.target.value)}
                placeholder="Sök destination..."
                className={`${inputClass} pl-10`}
              />
            </div>

            {destResults.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-md border border-white/8 bg-[#1a2230]">
                {destResults.map((result) => (
                  <button
                    key={result.label}
                    className="block w-full border-b border-white/6 px-3 py-2.5 text-left text-[13px] text-white/82 transition last:border-b-0 hover:bg-white/5"
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

          <div className="flex items-center gap-2.5">
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
                setSelectedOptionIndex(0);
                setCurrentScreen("plan");
                setShowPlanner(true);
                plan.reset();
              }}
              className={ghostButton}
            >
              Rensa
            </button>
          </div>
        </div>
        )}
      </OuterCard>

      {plan.isError && (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {(plan.error as Error)?.message ?? "Fel vid planering"}
        </div>
      )}

      {activeTrip && (
        <div className="mt-4">
          {journeyHeader && (
            <div className="mb-3">
              <div className={sectionLabel}>Din resa</div>
              <h3 className={heroTitle}>{journeyHeader.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-white/60">
                {journeyHeader.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
                {journeyHeader.realtimeDeltaLabel && (
                  <span className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] text-white/72">
                    {journeyHeader.realtimeDeltaLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          <JourneySummaryCard data={activeTrip} />

          <JourneyResults
            data={activeTrip}
            options={tripOptions}
            selectedOptionIndex={selectedOptionIndex}
            onSelectOption={(index) => {
              setSelectedOptionIndex(index);
              setSelectedSegment(null);
            }}
            onSelectSegment={(index) => {
              setSelectedSegment(index);
              if (index !== null) {
                setCurrentScreen("detail");
              }
            }}
            selectedIndex={selectedSegment}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default JourneyPage;
