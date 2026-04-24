import { useQuery } from "@tanstack/react-query";
import "./App.css";
import { useCurrentPosition } from "./hooks/useCurrentPosition";
import { apiFetch } from "./lib/api";



type NearbyBoardResponse = {
  nearestMetro: {
    siteName: string;
    access: {
      recommendedAccessMinutes: number;
      reason: string;
    };
    departures: Array<{
      line: string | null;
      destination: string | null;
      display: string | null;
      reachability: {
        recommendedGoNow: boolean;
        recommendedWalkInMinutes: number;
        status: string;
      } | null;
    }>;
  } | null;
};

function App() {
  const { position, isLocating, locationError, requestPosition } =
    useCurrentPosition();

 
  const nearbyBoardQuery = useQuery({
    queryKey: ["nearby-board", position?.lat, position?.lng],
    queryFn: () =>
      apiFetch<NearbyBoardResponse>(
        `/api/board/nearby?lat=${position!.lat}&lng=${position!.lng}`,
      ),
    enabled: Boolean(position),
  });

  const topMetro = nearbyBoardQuery.data?.nearestMetro;
  const topDeparture = topMetro?.departures[0];

  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 py-6 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium tracking-wide text-slate-500">
          HinnerJag
        </p>

        <h1 className="mt-2 text-3xl font-semibold">HinnerJag!!</h1>

        <div className="mt-6">
          <button
            onClick={() => requestPosition().catch(() => null)}
            disabled={isLocating}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isLocating ? "Hämtar position..." : "Tillåt location"}
          </button>

          {locationError && (
            <p className="mt-3 text-sm text-red-600">{locationError}</p>
          )}

          {position && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="text-sm font-medium text-slate-500">Din position</p>
              <p className="mt-2 text-sm text-slate-900">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
          <p className="text-sm font-medium text-slate-500">Nearby board</p>

          {!position && (
            <p className="mt-2 text-sm text-slate-600">
              Godkänn location först.
            </p>
          )}

          {nearbyBoardQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-600">
              Hämtar avgångar nära dig...
            </p>
          )}

          {nearbyBoardQuery.error && (
            <p className="mt-2 text-sm text-red-600">
              {(nearbyBoardQuery.error as Error).message}
            </p>
          )}

          {topMetro && (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {topMetro.siteName}
                </p>
                <p className="text-sm text-slate-600">
                  {topMetro.access.recommendedAccessMinutes} min till avgång
                </p>
                <p className="text-sm text-slate-500">
                  {topMetro.access.reason}
                </p>
              </div>

              {topDeparture && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Linje {topDeparture.line ?? "-"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {topDeparture.destination ?? "Ingen destination"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Avgår {topDeparture.display ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {topDeparture.reachability?.recommendedGoNow
                      ? "Gå nu"
                      : `Gå om ${topDeparture.reachability?.recommendedWalkInMinutes ?? "-"} min`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
