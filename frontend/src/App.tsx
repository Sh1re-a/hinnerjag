import { useEffect, useState } from "react";
import "./App.css";
import { BottomJourneyCta } from "./components/BottomJourneyCta";
import { BusBoard } from "./components/BusBoard";
import { DecisionCard } from "./components/DecisionCard";
import { LandingHeader } from "./components/LandingHeader";
import { LocationDialog } from "./components/LocationDialog";
import { MetroBoard } from "./components/MetroBoard";
import JourneyPage from "./pages/JourneyPage";
import { useCurrentPosition } from "./hooks/useCurrentPosition";
import { useNearbyBoard } from "./hooks/useNearbyBoard";
import { heroTitle, sectionLabel, smallText } from "./components/uiTokens";

type AddressState = { lat: number; lng: number; label: string };

function App() {
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const [manualPosition, setManualPosition] = useState<AddressState | null>(null);
  const [currentView, setCurrentView] = useState<"landing" | "journey">("landing");

  const { position, isLocating, locationError, requestPosition } =
    useCurrentPosition();

  const activePosition = manualPosition
    ? { lat: manualPosition.lat, lng: manualPosition.lng }
    : position;
  const nearbyBoardQuery = useNearbyBoard(activePosition);

  useEffect(() => {
    console.debug("nearbyBoard: position=", activePosition, "data=", nearbyBoardQuery.data);
  }, [activePosition, nearbyBoardQuery.data]);

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
      ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
      : "Din position";
  const locationTitle = manualPosition
    ? manualPosition.label.split(",")[0].trim()
    : position
      ? "Din position"
      : "Ingen plats vald";

  const journeyOrigin = manualPosition
    ? manualPosition
    : position
      ? { lat: position.lat, lng: position.lng, label: addressLabel }
      : null;

  const handleAllowLocation = async () => {
    try {
      await requestPosition();
      setShowLocationDialog(false);
    } catch {
      // The location hook already stores a user-facing error message.
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
          onSkip={() => setShowLocationDialog(false)}
        />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[414px] flex-col px-3 pb-22 pt-3 sm:max-w-3xl sm:px-6">
          <LandingHeader
            addressLabel={addressLabel}
            onSelectAddress={(lat, lng, label) => setManualPosition({ lat, lng, label })}
          />

          {currentView === "landing" ? (
            <>
              {!position && !showLocationDialog && (
                <button
                  onClick={() => {
                    setShowLocationDialog(true);
                  }}
                  className="mt-4 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/15"
                  type="button"
                >
                  Tillat location for att se boarden
                </button>
              )}

              <section className="mt-2.5">
                <div className={sectionLabel}>Din plats</div>
                <h1 className={heroTitle}>{locationTitle}</h1>
                <p className={`mt-1.5 max-w-md ${smallText}`}>
                  {activePosition
                    ? "Uppdaterad just nu. Se om du hinner tunnelbanan eller bussen innan du går."
                    : "Välj plats för att få en tydlig bild av vad du hinner just nu."}
                </p>
              </section>

              <DecisionCard
                platformMinutes={perrongMinutes}
                platformWalkMinutes={platformWalkMinutes}
                platformBufferMinutes={platformBufferMinutes}
                busWalkMinutes={busWalkMinutes}
              />

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
          ) : (
            <div className="w-full">
              <JourneyPage
                onBack={() => setCurrentView("landing")}
                originPreset={journeyOrigin}
                onSelectOrigin={(nextOrigin) => setManualPosition(nextOrigin)}
                onRequestCurrentPosition={requestPosition}
                isLocating={isLocating}
              />
            </div>
          )}
        </div>

        {currentView === "landing" && (
          <BottomJourneyCta onClick={() => setCurrentView("journey")} />
        )}
      </div>
    </main>
  );
}

export default App;
