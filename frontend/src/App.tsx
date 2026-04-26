import { useState } from "react";
import "./App.css";
import { BottomJourneyCta } from "./components/BottomJourneyCta";
import { BusBoard } from "./components/BusBoard";
import { DecisionCard } from "./components/DecisionCard";
import {
  JourneySearchDialog,
  type JourneyPlace,
  type JourneySearchSelection,
} from "./components/JourneySearchDialog";
import { LandingHeader } from "./components/LandingHeader";
import { LocationDialog } from "./components/LocationDialog";
import { MetroBoard } from "./components/MetroBoard";
import { useCurrentPosition } from "./hooks/useCurrentPosition";
import { useNearbyBoard } from "./hooks/useNearbyBoard";

function App() {
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const [showJourneyDialog, setShowJourneyDialog] = useState(false);
  const [journeySelection, setJourneySelection] =
    useState<JourneySearchSelection | null>(null);

  const { position, isLocating, locationError, requestPosition } =
    useCurrentPosition();

  const nearbyBoardQuery = useNearbyBoard(position);

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

  const addressLabel = position
    ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
    : "Din position";
  const currentLocation: JourneyPlace | null = position
    ? {
        id: "current-location",
        name: addressLabel,
        lat: position.lat,
        lng: position.lng,
        type: "current",
      }
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

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4 sm:max-w-3xl sm:px-6">
          <LandingHeader addressLabel={addressLabel} />

          {journeySelection && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p>
                Resa: <span className="font-medium text-white">{journeySelection.origin.name}</span>
                {" "}till <span className="font-medium text-white">{journeySelection.destination.name}</span>
              </p>
              {journeySelection.summary && (
                <p className="mt-1 text-white/65">
                  Ca {journeySelection.summary.realisticDurationMinutes ?? "-"} min
                  {journeySelection.summary.recommendedLeaveInMinutes !== null &&
                    ` • lämna om ${journeySelection.summary.recommendedLeaveInMinutes} min`}
                </p>
              )}
            </div>
          )}

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

          <DecisionCard
            platformMinutes={perrongMinutes}
            platformWalkMinutes={platformWalkMinutes}
            platformBufferMinutes={platformBufferMinutes}
            busWalkMinutes={busWalkMinutes}
          />

          <section className="mt-2.5 grid gap-2.5 xl:grid-cols-[1.06fr,0.94fr] xl:items-start">
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
        </div>

        <BottomJourneyCta onClick={() => setShowJourneyDialog(true)} />

        <JourneySearchDialog
          currentLocation={currentLocation}
          open={showJourneyDialog}
          onClose={() => setShowJourneyDialog(false)}
          onSelect={(selection) => {
            setJourneySelection(selection);
            setShowJourneyDialog(false);
          }}
        />
      </div>
    </main>
  );
}

export default App;