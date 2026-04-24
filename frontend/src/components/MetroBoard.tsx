import type { NearbySite } from "../hooks/useNearbyBoard";
import { formatDistance, getDepartureMessage, getStatusTone, getTimeTone } from "./boardUi";

type MetroBoardProps = {
  metro: NearbySite | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function MetroBoard({
  metro,
  isLoading,
  errorMessage,
}: MetroBoardProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#14181f]/95 p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
            Närmaste tunnelbana
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Live board
          </h2>
        </div>
        <p className="font-mono text-sm text-emerald-400">LIVE</p>
      </div>

      {isLoading && (
        <p className="mt-4 font-mono text-sm text-white/70">
          Hamtar avganger...
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && !metro && (
        <p className="mt-4 font-mono text-sm text-white/70">
          Ingen tunnelbana hittades nara dig an.
        </p>
      )}

      {metro && (
        <div className="mt-4">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                T
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-3xl font-semibold tracking-tight text-white">
                  {metro.siteName}
                </p>
                <p className="mt-1 text-base text-white/72">
                  {formatDistance(metro.distanceMeters)} • {metro.access.walkMinutes} min att ga
                </p>
                <p className="mt-2 text-sm text-white/55">
                  {metro.access.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-[#10141a]">
            <div className="grid grid-cols-[56px,1fr,100px] gap-3 border-b border-white/6 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              <span>Linje</span>
              <span>Mot</span>
              <span className="text-right">Avgar</span>
            </div>

            <div className="divide-y divide-white/6">
              {metro.departures.slice(0, 4).map((departure, index) => (
                <div
                  key={`${departure.line}-${departure.destination}-${index}`}
                  className="grid grid-cols-[56px,1fr,100px] items-center gap-3 px-4 py-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    {departure.line ?? "-"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xl font-medium text-white">
                      {departure.destination ?? "Okand destination"}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {getDepartureMessage(departure.reachability)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono text-3xl font-semibold ${getTimeTone(
                        departure.reachability?.status,
                      )}`}
                    >
                      {departure.display ?? "-"}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusTone(
                          departure.reachability?.status,
                        )}`}
                      >
                        {departure.reachability?.status ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 border-t border-white/6 px-4 py-4 text-base font-medium text-sky-300 transition hover:bg-white/5"
              type="button"
            >
              Visa alla avganger
              <span className="text-xl">⌄</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
