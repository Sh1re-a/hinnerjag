import { useEffect, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { BusBoard } from "./components/BusBoard";
import { BottomNav } from "./components/BottomNav";
import { LandingHeader } from "./components/LandingHeader";
import { LocationDialog } from "./components/LocationDialog";
import { MetroBoard } from "./components/MetroBoard";
import AboutPage from "./pages/AboutPage";
import JourneyPage from "./pages/JourneyPage";
import { searchAddress } from "./hooks/useAddressSearch";
import { useCurrentPosition } from "./hooks/useCurrentPosition";
import { useNearbyBoard } from "./hooks/useNearbyBoard";
import {
  heroTitle,
  iconButton,
  iconSize,
  inputClass,
  metaText,
  sectionLabel,
  smallText,
} from "./components/uiTokens";

type AddressState = { lat: number; lng: number; label: string };

const LOCATION_PROMPT_DISMISSED_KEY = "hinnerjag-location-prompt-dismissed";

function App() {
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [manualPosition, setManualPosition] = useState<AddressState | null>(
    null,
  );
  const [currentView, setCurrentView] = useState<
    "landing" | "journey" | "about"
  >("landing");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressState[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { position, isLocating, locationError, requestPosition } =
    useCurrentPosition();

  useEffect(() => {
    let isMounted = true;

    const initLocationPrompt = async () => {
      const dismissed =
        window.localStorage.getItem(LOCATION_PROMPT_DISMISSED_KEY) === "1";

      if (position) {
        if (isMounted) {
          setShowLocationDialog(false);
        }
        return;
      }

      if (!("permissions" in navigator) || !navigator.permissions?.query) {
        if (!dismissed && isMounted) {
          setShowLocationDialog(true);
        }
        return;
      }

      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });

        if (!isMounted) return;

        if (permission.state === "granted") {
          try {
            await requestPosition();
            window.localStorage.removeItem(LOCATION_PROMPT_DISMISSED_KEY);
            if (isMounted) {
              setShowLocationDialog(false);
            }
          } catch {
            if (!dismissed) {
              setShowLocationDialog(true);
            }
          }
          return;
        }

        if (permission.state === "prompt") {
          setShowLocationDialog(!dismissed);
          return;
        }

        setShowLocationDialog(false);
      } catch {
        if (!dismissed && isMounted) {
          setShowLocationDialog(true);
        }
      }
    };

    void initLocationPrompt();

    return () => {
      isMounted = false;
    };
  }, [position, requestPosition]);

  const activePosition = manualPosition
    ? { lat: manualPosition.lat, lng: manualPosition.lng }
    : position;
  const nearbyBoardQuery = useNearbyBoard(activePosition);

  const errorMessage =
    nearbyBoardQuery.error instanceof Error
      ? nearbyBoardQuery.error.message
      : null;

  const metro = nearbyBoardQuery.data?.nearestMetro ?? null;
  const perrongMinutes = metro?.access.recommendedAccessMinutes ?? null;
  const platformWalkMinutes = metro?.access.walkMinutes ?? null;
  const platformBufferMinutes = metro?.access.bufferMinutes ?? null;
  const busWalkMinutes =
    nearbyBoardQuery.data?.nearbyBusStops[0]?.access.walkMinutes ?? null;

  const addressLabel = manualPosition
    ? manualPosition.label
    : position
      ? "Din plats"
      : "Din position";

  const journeyOrigin = manualPosition
    ? manualPosition
    : position
      ? { lat: position.lat, lng: position.lng, label: addressLabel }
      : null;

  const handleAllowLocation = async () => {
    try {
      await requestPosition();
      window.localStorage.removeItem(LOCATION_PROMPT_DISMISSED_KEY);
      setShowLocationDialog(false);
    } catch {
      // The location hook already stores a user-facing error message.
    }
  };

  const handleSkipLocation = () => {
    window.localStorage.setItem(LOCATION_PROMPT_DISMISSED_KEY, "1");
    setShowLocationDialog(false);
  };

  const handleOpenLocationDialog = () => {
    setShowLocationDialog(true);
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchAddress(value);
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#23384e_0%,#0c1520_28%,#05070b_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,9,0.18)_0%,rgba(1,4,9,0.72)_52%,rgba(1,4,9,0.94)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_100%)]" />

        <LocationDialog
          open={!position && showLocationDialog}
          isLocating={isLocating}
          locationError={locationError}
          onAllow={() => {
            void handleAllowLocation();
          }}
          onSkip={handleSkipLocation}
        />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[414px] flex-col px-3 pb-24 pt-3 sm:max-w-3xl sm:px-6">
          <LandingHeader />

          {currentView === "landing" ? (
            <>
              {!position && !showLocationDialog && (
                <button
                  onClick={() => {
                    handleOpenLocationDialog();
                  }}
                  className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/82 backdrop-blur transition hover:bg-white/[0.07]"
                  type="button"
                >
                  Tillåt plats för att se avgångar nära dig
                </button>
              )}

              <section className="mt-4 px-1">
                <header className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300">
                    <LocateFixed size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={metaText}>Aktiv plats</p>
                    <p className="mt-1 truncate text-[13px] text-white/72">
                      {addressLabel}
                    </p>
                  </div>
                </header>

                <div className="mt-5 max-w-[260px]">
                  <h1 className={heroTitle}>Hinner jag?</h1>
                  <p className={`mt-2 max-w-[280px] ${smallText}`}>
                    {activePosition
                      ? "Se om du hinner innan du går."
                      : "Välj plats för att få en tydlig bild av vad du hinner just nu."}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
                    <input
                      className={`${inputClass} pl-10`}
                      placeholder="Sök adress eller plats..."
                      value={query}
                      onChange={(e) => {
                        void handleSearch(e.target.value);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Använd min position"
                    onClick={() => {
                      handleOpenLocationDialog();
                    }}
                  >
                    <LocateFixed className={iconSize} />
                  </button>
                </div>

                {isSearching && (
                  <div className="mt-1 text-xs text-white/60">Söker…</div>
                )}
                {results.length > 0 && (
                  <ul className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#1a2230] p-2">
                    {results.map((result) => (
                      <li key={result.label} className="list-none">
                        <button
                          className="block w-full rounded-lg px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5"
                          onClick={() => {
                            setQuery(result.label);
                            setResults([]);
                            setManualPosition(result);
                          }}
                          type="button"
                        >
                          {result.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="mt-3">
                <div className={sectionLabel}>Nära dig</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-sky-300">
                      Tunnelbana
                    </div>
                    <p className="mt-3 text-[18px] font-semibold leading-none text-emerald-300">
                      {perrongMinutes === null ? "--" : `${perrongMinutes} min`}
                    </p>
                    <p className={`mt-2 ${smallText}`}>
                      {platformWalkMinutes === null ||
                      platformBufferMinutes === null
                        ? "gång + spärr/trappa"
                        : `${platformWalkMinutes} min gång + ${platformBufferMinutes} min spärr/trappa`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-sky-300">
                      Buss
                    </div>
                    <p className="mt-3 text-[18px] font-semibold leading-none text-emerald-300">
                      {busWalkMinutes === null ? "--" : `${busWalkMinutes} min`}
                    </p>
                    <p className={`mt-2 ${smallText}`}>
                      Gångavstånd till hållplats
                    </p>
                  </div>
                </div>

                <p className={`mt-2 ${smallText}`}>
                  Beräknat från där du står till perrong eller hållplats.
                </p>
              </section>

              <section className="mt-2 grid gap-2 xl:grid-cols-[1.06fr,0.94fr] xl:items-start">
                <MetroBoard
                  metro={metro}
                  isLoading={nearbyBoardQuery.isLoading}
                  errorMessage={errorMessage}
                />

                <BusBoard
                  busStops={nearbyBoardQuery.data?.nearbyBusStops ?? []}
                  isLoading={nearbyBoardQuery.isLoading}
                  errorMessage={errorMessage}
                />
              </section>
            </>
          ) : currentView === "journey" ? (
            <div className="w-full">
              <JourneyPage
                onBack={() => setCurrentView("landing")}
                originPreset={journeyOrigin}
                onSelectOrigin={(nextOrigin) => setManualPosition(nextOrigin)}
                onRequestCurrentPosition={requestPosition}
                isLocating={isLocating}
              />
            </div>
          ) : (
            <AboutPage />
          )}
        </div>

        <BottomNav currentView={currentView} onChange={setCurrentView} />
      </div>
    </main>
  );
}

export default App;
