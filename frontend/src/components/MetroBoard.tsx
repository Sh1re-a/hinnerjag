import { Bus, ChevronDown, Footprints, MoveRight, TrainFront } from "lucide-react";
import type { NearbySite, Reachability } from "../hooks/useNearbyBoard";
import { getStatusBadgeTone, getStatusTone } from "./boardUi";

type MetroBoardProps = {
  metro: NearbySite | null;
  isLoading: boolean;
  errorMessage: string | null;
};

const VISIBLE_DEPARTURES = 4;

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
  const walkMinutes = site.access.walkMinutes;
  const platformMinutes = site.access.recommendedAccessMinutes;

  return `${walkMinutes} min till station • ca ${platformMinutes} min till perrong`;
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

export function MetroBoard({ metro, isLoading, errorMessage }: MetroBoardProps) {
  const uniqueDepartures = metro ? getUniqueDepartures(metro.departures) : [];
  const visibleDepartures = uniqueDepartures.slice(0, VISIBLE_DEPARTURES);

  const nextCatchableDeparture =
    metro?.departures.find(
      (departure) => departure.reachability?.status !== "MISS",
    ) ?? null;
  const nextCatchableMinutes =
    nextCatchableDeparture?.reachability?.minutesUntilDeparture ?? null;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171c22]/95 p-2.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-3">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div className="inline-flex items-center gap-2 text-sky-400">
          <Bus size={16} />
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">TUNNELBANA</p>
        </div>

        <button
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
          type="button"
        >
          Visa alla ({uniqueDepartures.length})
          <MoveRight size={15} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151c27]/95">
        <div className="flex items-start justify-between gap-2.5 border-b border-white/8 px-2.5 py-2.5">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <TrainFront size={16} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold leading-tight text-white">
                {metro?.siteName ?? "-"}
              </p>
              {metro && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/72">
                  <span className="inline-flex items-center gap-1.5">
                    <Footprints size={10} />
                    {getGoHint(metro)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ChevronDown className="mt-1 shrink-0 text-white/45" size={15} />
        </div>

        {isLoading && (
          <p className="px-3 py-4 text-sm text-white/65">Hämtar avgångar...</p>
        )}

        {errorMessage && (
          <p className="m-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && !metro && (
          <p className="px-3 py-4 text-sm text-white/65">
            Ingen tunnelbana hittades nära dig ännu.
          </p>
        )}

        {metro && (
          <>
            <div className="divide-y divide-white/6 px-2.5">
              {visibleDepartures.map((departure, index) => {
                const actionLabel = getActionLabel(departure.reachability);
                const displayLabel = getDisplayLabel(departure);
                const tone = getTimeTone(
                  displayLabel,
                  departure.reachability?.status,
                );

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
                      <p className={`font-mono text-[15px] font-semibold leading-none ${tone}`}>
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
                Tips: {nextCatchableMinutes === null
                  ? "Du missar de närmaste avgångarna"
                  : `Gå nu för att hinna nästa om ${nextCatchableMinutes <= 0 ? "Nu" : `${nextCatchableMinutes} min`}`}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
