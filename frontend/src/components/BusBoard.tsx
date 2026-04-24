import { BusFront, ChevronDown, Footprints } from "lucide-react";
import { useState } from "react";
import type { NearbySite } from "../hooks/useNearbyBoard";
import { getStatusBadgeTone, getStatusTone } from "./boardUi";

type BusBoardProps = {
  busStops: NearbySite[];
  isLoading: boolean;
};

const DEFAULT_VISIBLE = 5;
const MAX_VISIBLE = 20;

function getDisplayLabel(departure: NearbySite["departures"][number]) {
  const minutes = departure.reachability?.minutesUntilDeparture;

  if (typeof minutes === "number") {
    if (minutes <= 0) {
      return "Nu";
    }
    return `${minutes} min`;
  }

  return departure.display ?? "-";
}

function getUniqueDepartures(departures: NearbySite["departures"]) {
  const seen = new Set<string>();

  return departures.filter((departure) => {
    const minuteKey =
      departure.reachability?.minutesUntilDeparture ?? departure.display ?? "-";
    const key = `${departure.line ?? "-"}|${departure.destination ?? "-"}|${minuteKey}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getGoHint(site: NearbySite) {
  const nextReachable = site.departures.find(
    (departure) =>
      departure.reachability && departure.reachability.status !== "MISS",
  )?.reachability;

  const walkAndBuffer = `gång ${site.access.walkMinutes} + buffer ${site.access.bufferMinutes}`;

  if (!nextReachable) {
    return `Gå senast: nu (${walkAndBuffer})`;
  }

  if (nextReachable.recommendedWalkInMinutes <= 0) {
    return `Gå senast: nu (${walkAndBuffer})`;
  }

  return `Gå senast om ${nextReachable.recommendedWalkInMinutes} min (${walkAndBuffer})`;
}

function getActionLabel(
  reachability: NearbySite["departures"][number]["reachability"],
) {
  if (!reachability) {
    return null;
  }

  if (reachability.status === "MISS") {
    return "MISSAR";
  }

  if (reachability.status === "TIGHT") {
    return reachability.recommendedGoNow ? "GÅ NU!" : "TVEKSAM";
  }

  if (reachability.recommendedGoNow) {
    return "GÅ NU!";
  }

  const minutes = Math.max(1, reachability.recommendedWalkInMinutes);
  return `Gå om ${minutes} min`;
}

export function BusBoard({ busStops, isLoading }: BusBoardProps) {
  const primaryStop = busStops[0] ?? null;
  const secondaryStops = busStops.slice(1, 3);
  const [showAllDepartures, setShowAllDepartures] = useState(false);
  const uniqueDepartures = primaryStop
    ? getUniqueDepartures(primaryStop.departures)
    : [];
  const visibleDepartures = primaryStop
    ? uniqueDepartures.slice(
        0,
        showAllDepartures
          ? Math.min(uniqueDepartures.length, MAX_VISIBLE)
          : Math.min(uniqueDepartures.length, DEFAULT_VISIBLE),
      )
    : [];

  const getTimeTone = (display: string | null, fallback: string) => {
    if (!display) {
      return fallback;
    }

    if (display.toLowerCase() === "nu") {
      return "text-emerald-400";
    }

    const minuteMatch = display.match(/(\d+)\s*min/i);
    if (minuteMatch) {
      const minutes = Number(minuteMatch[1]);
      if (minutes <= 3) {
        return "text-amber-300";
      }
    }

    return fallback;
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#171c22]/92 p-3 text-white shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-3.5">
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Närmaste busshållplatser
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">
            Buss nära dig
          </h2>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
          3 närmaste
        </p>
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-white/65">Hämtar bussar...</p>
      )}

      {!isLoading && busStops.length === 0 && (
        <p className="mt-4 text-sm text-white/65">
          Inga busshållplatser hittades.
        </p>
      )}

      <div className="mt-3.5 space-y-3.5">
        {primaryStop && (
          <div key={primaryStop.siteId}>
            <div className="flex items-start justify-between gap-2.5 px-0.5">
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <BusFront size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold leading-tight text-white">
                    {primaryStop.siteName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-white/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Footprints size={10} />
                      {getGoHint(primaryStop)}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronDown className="mt-1 shrink-0 text-white/45" size={15} />
            </div>

            <div className="mt-2.5 border-t border-white/8" />

            <div
              className={`divide-y divide-white/6 ${
                showAllDepartures && visibleDepartures.length > 8
                  ? "max-h-78 overflow-y-auto pr-1"
                  : ""
              }`}
            >
              {visibleDepartures.map((departure, index) => {
                const fallbackTone = getStatusTone(
                  departure.reachability?.status,
                );
                const actionLabel = getActionLabel(departure.reachability);
                const displayLabel = getDisplayLabel(departure);

                return (
                  <div
                    key={`${primaryStop.siteId}-${departure.line}-${index}`}
                    className="flex items-center justify-between gap-2.5 py-1.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500 text-[12px] font-semibold text-white">
                        {departure.line ?? "-"}
                      </div>

                      <p className="truncate text-[15px] font-medium text-white">
                        {departure.destination ?? "Okänd destination"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <p
                        className={`font-mono text-[15px] font-semibold leading-none ${getTimeTone(
                          displayLabel,
                          fallbackTone,
                        )}`}
                      >
                        {displayLabel}
                      </p>

                      {actionLabel && departure.reachability && (
                        <span
                          className={`inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.04em] ${getStatusBadgeTone(
                            departure.reachability.status,
                          )}`}
                        >
                          {actionLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {uniqueDepartures.length > DEFAULT_VISIBLE && (
              <button
                className="mt-1 flex w-full items-center justify-center gap-1.5 border-t border-white/8 pt-2 text-[12px] font-medium text-sky-300 transition hover:text-sky-200"
                type="button"
                onClick={() => setShowAllDepartures((prev) => !prev)}
              >
                {showAllDepartures
                  ? "Visa färre"
                  : `Visa fler (${Math.min(uniqueDepartures.length, MAX_VISIBLE)})`}
                <ChevronDown
                  size={14}
                  className={showAllDepartures ? "rotate-180" : ""}
                />
              </button>
            )}

            {uniqueDepartures.length > MAX_VISIBLE && showAllDepartures && (
              <p className="mt-1 text-center text-[11px] text-white/45">
                Visar {MAX_VISIBLE} av {uniqueDepartures.length} avgångar.
              </p>
            )}

            {showAllDepartures && visibleDepartures.length > 8 && (
              <p className="mt-1 text-center text-[11px] text-white/45">
                Scrolla för fler avgångar.
              </p>
            )}
          </div>
        )}

        {secondaryStops.map((stop) => (
          <div
            key={stop.siteId}
            className="flex items-center justify-between gap-3 border-t border-white/6 pt-2.5"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white">
                <BusFront size={14} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {stop.siteName}
                </p>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Footprints size={10} />
                    {getGoHint(stop)}
                  </span>
                </div>
              </div>
            </div>

            <ChevronDown className="shrink-0 text-white/45" size={16} />
          </div>
        ))}
      </div>
    </section>
  );
}
