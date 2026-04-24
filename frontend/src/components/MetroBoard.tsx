import {
  ChevronDown,
  Footprints,
  RefreshCw,
  TrainFront,
} from "lucide-react";
import { useState } from "react";
import type { NearbySite } from "../hooks/useNearbyBoard";
import { getStatusBadgeTone, getStatusTone } from "./boardUi";

type MetroBoardProps = {
  metro: NearbySite | null;
  isLoading: boolean;
  errorMessage: string | null;
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

export function MetroBoard({
  metro,
  isLoading,
  errorMessage,
}: MetroBoardProps) {
  const [showAllDepartures, setShowAllDepartures] = useState(false);
  const uniqueDepartures = metro ? getUniqueDepartures(metro.departures) : [];
  const visibleDepartures = metro
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
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171c22]/95 p-3 text-white shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-3.5">
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Närmaste tunnelbana
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">Live board</h2>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <RefreshCw size={14} />
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Live
          </span>
        </div>
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-white/65">Hämtar avgångar...</p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && !metro && (
        <p className="mt-4 text-sm text-white/65">
          Ingen tunnelbana hittades nära dig ännu.
        </p>
      )}

      {metro && (
        <div className="mt-2.5">
          <div className="flex items-start justify-between gap-2.5 px-0.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <TrainFront size={16} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold leading-tight text-white">
                  {metro.siteName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Footprints size={10} />
                    {getGoHint(metro)}
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
              const fallbackTone = getStatusTone(departure.reachability?.status);
              const actionLabel = getActionLabel(departure.reachability);
              const displayLabel = getDisplayLabel(departure);

              return (
                <div
                  key={`${departure.line}-${departure.destination}-${index}`}
                  className="flex items-center justify-between gap-2.5 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-[12px] font-semibold text-white">
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
    </section>
  );
}
