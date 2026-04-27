import { useState } from "react";
import type { TripSummaryResponse } from "../hooks/useJourneyPlan";
import { OuterCard } from "./CardBase";
import TransportPill from "./TransportPill";
import { badgeBase, metaText, sectionLabel, sectionTitle, smallText } from "./uiTokens";
import { getStatusBadgeTone, getStatusFromLeave } from "./boardUi";

type Stop = {
  name?: string | null;
  arrivalTime?: string | null;
  departureTime?: string | null;
  platform?: string | null;
};

type Segment = {
  type?: string | null;
  from?: string | null;
  to?: string | null;
  durationMinutes?: number | null;
  mode?: string | null;
  line?: string | null;
  toward?: string | null;
  platform?: string | null;
};

type Props = {
  data: TripSummaryResponse;
  segmentIndex: number;
  originLabel?: string;
  destinationLabel?: string;
};

export function JourneyDetail({ data, segmentIndex, originLabel, destinationLabel }: Props) {
  const stops = (data.stops ?? []) as Stop[];
  const segments = (data.segments ?? []) as Segment[];
  const route = data.route ?? {};
  const [showStops, setShowStops] = useState(false);
  const leaveMin = data.recommendedLeaveInMinutes ?? null;
  const status = getStatusFromLeave(leaveMin);

  return (
    <div className="mt-5 space-y-4">
      <div>
        <div className={sectionLabel}>Din resa</div>
        <h3 className={`mt-2 ${sectionTitle}`}>
          {(originLabel && destinationLabel)
            ? `${originLabel} → ${destinationLabel}`
            : "Steg för steg"}
        </h3>
      </div>

      <OuterCard>
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className={metaText}>{route.departureTime ?? "—"} → {route.arrivalTime ?? "—"}</div>
            <div className="mt-3 text-4xl font-semibold leading-none text-white">{data.realisticDurationMinutes ?? data.plannedDurationMinutes ?? "-"} min</div>
            <div className={`mt-3 ${smallText}`}>Gång {data.walkingDurationMinutes ?? 0} min · {data.transfers ?? 0} byten</div>
          </div>
          <div className="shrink-0 text-right">
            <div className={metaText}>Gå senast</div>
            <div className="mt-2 text-3xl font-semibold leading-none">{data.recommendedLeaveAt ?? "—"}</div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className={`${badgeBase} ${getStatusBadgeTone(status.key as any)}`}>{status.label}</span>
            </div>
            <div className={`mt-3 ${smallText}`}>{leaveMin != null ? `Gå om ${leaveMin} min` : "Ingen rekommendation"}</div>
          </div>
        </div>
      </OuterCard>

      <OuterCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-base font-semibold text-cyan-100">Steg-för-steg</div>
          <div className="text-xs text-white/50">Del {segmentIndex + 1}</div>
        </div>

        {segments.length === 0 && <div className="text-sm text-white/55">Inget stegdata tillgängligt.</div>}

        <div className="space-y-2">
          {segments.map((seg, i) => (
            <div
              key={`seg-${i}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <TransportPill line={seg.line} mode={seg.mode} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-white">
                    {seg.mode ?? seg.type ?? "Steg"} {seg.line ? seg.line : ""}
                  </div>
                  <div className="truncate text-xs text-white/55">
                    {[seg.from, seg.to].filter(Boolean).join(" → ") || "Följ detta steg"}
                  </div>
                  {seg.toward && (
                    <div className="mt-1 truncate text-xs text-white/45">Mot {seg.toward}</div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="font-mono text-sm font-semibold text-white/70">{seg.durationMinutes ?? "-"} min</div>
                {seg.platform && <div className="mt-1 text-xs text-white/45">Spår {seg.platform}</div>}
              </div>
            </div>
          ))}
        </div>
      </OuterCard>

      {stops.length > 0 && (
        <OuterCard>
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-cyan-100">Stationer</div>
            <button
              type="button"
              onClick={() => setShowStops((current) => !current)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8"
            >
              {showStops ? "Dölj" : "Visa"}
            </button>
          </div>

          <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: showStops ? 1000 : 0 }}>
            <ul className="mt-4 space-y-2">
              {stops.map((stop, i) => (
                <li
                  key={`stop-${i}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3 text-sm"
                >
                  <div className="min-w-0 truncate text-white/78">{stop.name}</div>
                  <div className="shrink-0 font-mono text-white/56">{stop.departureTime ?? stop.arrivalTime ?? "-"}</div>
                </li>
              ))}
            </ul>
          </div>
        </OuterCard>
      )}
    </div>
  );
}

export default JourneyDetail;
