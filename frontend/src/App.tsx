import { LocateFixed, RefreshCw } from "lucide-react";
import { useState } from "react";
import "./App.css";
import { LocationDialog } from "./components/LocationDialog";
import { MetroBoard } from "./components/MetroBoard";
import { BusBoard } from "./components/BusBoard";
import { useCurrentPosition } from "./hooks/useCurrentPosition";
import { useNearbyBoard } from "./hooks/useNearbyBoard";

function App() {
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const { position, isLocating, locationError, requestPosition } =
    useCurrentPosition();

  const nearbyBoardQuery = useNearbyBoard(position);

  const errorMessage =
    nearbyBoardQuery.error instanceof Error
      ? nearbyBoardQuery.error.message
      : null;

  const stationName =
    nearbyBoardQuery.data?.nearestMetro?.siteName ?? "Din position";
  const updatedText = nearbyBoardQuery.dataUpdatedAt
    ? "Uppdaterad just nu"
    : "Vantar pa live-data";

  const handleAllowLocation = async () => {
    try {
      await requestPosition();
      setShowLocationDialog(false);
    } catch {
      // The location hook already stores a user-facing error message.
    }
  };

  const handleRefresh = () => {
    if (!position) {
      setShowLocationDialog(true);
      return;
    }

    nearbyBoardQuery.refetch();
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
          <nav className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                HinnerJag
              </p>
              <p className="mt-1 text-sm text-white/65">Perrongkansla hemma</p>
            </div>

            <button
              onClick={handleRefresh}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/15"
              type="button"
            >
              <RefreshCw size={20} />
            </button>
          </nav>

          <header className="mt-6 flex items-start justify-between gap-4 sm:mt-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300 backdrop-blur">
                <LocateFixed size={26} />
              </div>

              <div className="min-w-0">
                <p className="text-base text-white/60 sm:text-lg">
                  Din position
                </p>
                <h1 className="truncate text-[2.15rem] font-semibold tracking-tight text-white sm:text-5xl">
                  {stationName}
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.95)]" />
                  {updatedText}
                </p>
              </div>
            </div>
          </header>

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

          <section className="mt-5 grid gap-3 xl:grid-cols-[1.06fr,0.94fr] xl:items-start">
            <MetroBoard
              metro={nearbyBoardQuery.data?.nearestMetro ?? null}
              isLoading={nearbyBoardQuery.isLoading}
              errorMessage={errorMessage}
            />

            <BusBoard
              busStops={nearbyBoardQuery.data?.nearbyBusStops ?? []}
              isLoading={nearbyBoardQuery.isLoading}
            />
          </section>
        </div>

        <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-3xl sm:inset-x-6">
          <button
            className="flex w-full items-center justify-between rounded-[24px] bg-emerald-500 px-5 py-4 text-left text-base font-semibold text-white shadow-[0_16px_36px_rgba(34,197,94,0.30)] transition hover:bg-emerald-400 sm:text-lg"
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">➜</span>
              Hinner du med din resa?
            </span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
