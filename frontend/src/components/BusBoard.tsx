import { BusFront, ChevronDown, Footprints } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NearbySite, Reachability } from "../hooks/useNearbyBoard";
import { getStatusBadgeTone, getStatusTone } from "./boardUi";

type BusBoardProps = {
  busStops: NearbySite[];
  isLoading: boolean;
  errorMessage: string | null;
};

const VISIBLE_STOPS = 3;
const VISIBLE_DEPARTURES = 2;

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
  return `${site.access.walkMinutes} min till hållplats`;
}

function getActionLabel(
  reachability: NearbySite["departures"][number]["reachability"],
) {
  if (!reachability) {
    return null;
  }

  if (reachability.status === "MISS") {
    return "Missar";
  }

  if (reachability.recommendedGoNow || reachability.status === "TIGHT") {
    return "Gå nu";
  }

  return "Du hinner";
}

function getTimeTone(
  displayLabel: string,
  status: Reachability["status"] | undefined,
) {
  if (status === "MISS") {
    return "text-rose-400";
  }

  if (displayLabel.toLowerCase() === "nu") {
    return "text-emerald-400";
  }

  const minuteMatch = displayLabel.match(/(\d+)\s*min/i);
  if (minuteMatch) {
    const minutes = Number(minuteMatch[1]);
    if (minutes <= 3) {
      return "text-amber-300";
    }
  }

  return getStatusTone(status);
}

export function BusBoard({
  busStops,
  isLoading,
  errorMessage,
}: BusBoardProps) {
  const [openStopIds, setOpenStopIds] = useState<Set<number>>(new Set());
  const [expandedStopIds, setExpandedStopIds] = useState<Set<number>>(new Set());
  const hasOpenedDefaultStops = useRef(false);

  const visibleStops = busStops.slice(0, VISIBLE_STOPS);

  useEffect(() => {
    if (hasOpenedDefaultStops.current || visibleStops.length === 0) {
      return;
    }

    setOpenStopIds(new Set(visibleStops.map((stop) => stop.siteId)));
    hasOpenedDefaultStops.current = true;
  }, [visibleStops]);

  const toggleStopOpen = (siteId: number) => {
    setOpenStopIds((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  const toggleShowMore = (siteId: number) => {
    setExpandedStopIds((prev) => {
      const next = new Set(prev);

      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }

      return next;
    });
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171c22]/95 p-2.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-3">
      <div className="mb-2 px-0.5">
        <div className="inline-flex items-center gap-2 text-sky-400">
          <BusFront size={16} />
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">
            BUSS NÄRA DIG
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151c27]/95">
          <p className="px-3 py-4 text-sm text-white/65">Hämtar bussar...</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/10">
          <p className="px-3 py-4 text-sm text-rose-300">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && busStops.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151c27]/95">
          <p className="px-3 py-4 text-sm text-white/65">
            Inga busshållplatser hittades.
          </p>
        </div>
      )}

      {!isLoading && visibleStops.length > 0 && (
        <div className="space-y-2">
          {visibleStops.map((stop) => {
            const isStopOpen = openStopIds.has(stop.siteId);
            const isExpanded = expandedStopIds.has(stop.siteId);
            const uniqueDepartures = getUniqueDepartures(stop.departures);
            const stopDepartures = isExpanded
              ? uniqueDepartures
              : uniqueDepartures.slice(0, VISIBLE_DEPARTURES);

            const nextCatchableDeparture =
              stop.departures.find(
                (departure) => departure.reachability?.status !== "MISS",
              ) ?? null;
            const nextCatchableMinutes =
              nextCatchableDeparture?.reachability?.minutesUntilDeparture ?? null;

            return (
              <div
                key={stop.siteId}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#151c27]/95"
              >
                <div className="flex min-h-18 items-start justify-between gap-2.5 border-b border-white/8 px-2.5 py-2.5">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                      <BusFront size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold leading-tight text-white">
                        {stop.siteName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/72">
                        <span className="inline-flex items-center gap-1.5">
                          <Footprints size={10} />
                          {getGoHint(stop)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStopOpen(stop.siteId)}
                    className="mt-1 shrink-0 text-white/45 transition hover:text-white/70"
                    aria-label={isStopOpen ? "Stäng bussavgångar" : "Öppna bussavgångar"}
                    type="button"
                  >
                    <ChevronDown
                      className={`transition-transform duration-200 ${isStopOpen ? "rotate-180" : "rotate-0"}`}
                      size={15}
                    />
                  </button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${isStopOpen ? "max-h-225 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="divide-y divide-white/6 px-2.5">
                    {stopDepartures.map((departure, index) => {
                      const actionLabel = getActionLabel(departure.reachability);
                      const displayLabel = getDisplayLabel(departure);
                      const tone = getTimeTone(
                        displayLabel,
                        departure.reachability?.status,
                      );

                      return (
                        <div
                          key={`${stop.siteId}-${departure.line}-${index}`}
                          className="flex items-center justify-between gap-2.5 py-1.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-500 text-[12px] font-semibold text-white">
                              {departure.line ?? "-"}
                            </div>

                            <p className="truncate text-[15px] font-medium text-white">
                              {departure.destination ?? "Okänd destination"}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <p
                              className={`font-mono text-[15px] font-semibold leading-none ${tone}`}
                            >
                              {displayLabel}
                            </p>

                            {actionLabel && departure.reachability && (
                              <span
                                className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.02em] ${getStatusBadgeTone(
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

                  <div className="border-t border-white/8 px-2.5 py-1.5">
                    <p className="text-sm text-emerald-300">
                      Tips:{" "}
                      {nextCatchableMinutes === null
                        ? "Du missar de närmaste avgångarna"
                        : `Gå nu för att hinna nästa om ${nextCatchableMinutes <= 0 ? "Nu" : `${nextCatchableMinutes} min`}`}
                    </p>

                    {uniqueDepartures.length > VISIBLE_DEPARTURES && (
                      <button
                        onClick={() => toggleShowMore(stop.siteId)}
                        className="mt-2 text-sm font-medium text-white/75 transition hover:text-white"
                        type="button"
                      >
                        {isExpanded ? "Visa färre avgångar" : "Visa fler avgångar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
