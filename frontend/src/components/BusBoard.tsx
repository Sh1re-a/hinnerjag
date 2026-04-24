import type { NearbySite } from "../hooks/useNearbyBoard";
import {
  formatDistance,
  getDepartureMessage,
  getStatusTone,
  getTimeTone,
} from "./boardUi";

type BusBoardProps = {
  busStops: NearbySite[];
  isLoading: boolean;
};

export function BusBoard({ busStops, isLoading }: BusBoardProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[#171c23]/92 p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
            Närmaste busshallplatser
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Buss nara dig
          </h2>
        </div>
        <p className="text-sm text-white/50">3 narmaste</p>
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-white/70">Hamtar bussar...</p>
      )}

      {!isLoading && busStops.length === 0 && (
        <p className="mt-4 text-sm text-white/70">
          Inga busshallplatser hittades.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {busStops.slice(0, 3).map((stop) => (
          <div
            key={stop.siteId}
            className="rounded-3xl border border-white/8 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-2xl text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  🚌
                </div>

                <div>
                  <p className="text-xl font-semibold text-white">
                    {stop.siteName}
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    {formatDistance(stop.distanceMeters)} •{" "}
                    {stop.access.walkMinutes} min att ga
                  </p>
                </div>
              </div>

              <p className="text-2xl text-white/45">⌄</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-[#12171d]">
              {stop.departures.slice(0, 3).map((departure, index) => (
                <div
                  key={`${stop.siteId}-${departure.line}-${index}`}
                  className="grid grid-cols-[54px,1fr,90px] items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-lg font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    {departure.line ?? "-"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium text-white">
                      {departure.destination ?? "Okand destination"}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {getDepartureMessage(departure.reachability)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono text-2xl font-semibold ${getTimeTone(
                        departure.reachability?.status,
                      )}`}
                    >
                      {departure.display ?? "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-white/55">
              <p>{stop.access.reason}</p>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusTone(
                  stop.departures[0]?.reachability?.status,
                )}`}
              >
                {stop.departures[0]?.reachability?.status ?? "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
