import type { TripSummaryResponse } from "../hooks/useJourneyPlan";
import { getStatusBadgeTone, getStatusFromLeave } from "./boardUi";
import { OuterCard } from "./CardBase";
import { badgeBase, metaText, mutedXs, smallText } from "./uiTokens";

type Props = {
  data: TripSummaryResponse;
  variant?: "summary" | "option";
  isSelected?: boolean;
  isPrimary?: boolean;
  onSelect?: () => void;
};

export default function JourneyCard({ data, variant = "option", isSelected, isPrimary, onSelect }: Props) {
  const route = data.route ?? {};
  const leaveMin = data.recommendedLeaveInMinutes ?? null;
  const status = getStatusFromLeave(leaveMin);
  const duration = data.realisticDurationMinutes ?? data.plannedDurationMinutes ?? "-";
  const transfers = data.transfers ?? 0;
  const walk = data.walkingDurationMinutes ?? 0;

  if (variant === "summary") {
    return (
      <OuterCard>
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className={metaText}>{route.departureTime ?? "—"} → {route.arrivalTime ?? "—"}</div>
            <div className="mt-3 text-4xl font-semibold leading-none text-white">{duration} min</div>
            <div className={`mt-3 ${smallText}`}>Gång {walk} min · {transfers} byten</div>
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
    );
  }

  return (
    <OuterCard innerClassName={isSelected ? "border-emerald-400/20 ring-1 ring-emerald-400/20 shadow-[0_22px_60px_rgba(16,185,129,0.12)]" : ""}>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left ${isPrimary ? "" : "opacity-95 hover:opacity-100"}`}
        aria-pressed={isSelected}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isPrimary && (
                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Bästa alternativet
                </span>
              )}
              <span className={`${badgeBase} ${getStatusBadgeTone(status.key as any)}`}>{status.label}</span>
            </div>
            <div className={metaText}>{route.departureTime ?? "—"} → {route.arrivalTime ?? "—"}</div>
            <div className="mt-3 text-3xl font-semibold leading-none text-white">{duration} min</div>
            <div className={`mt-3 ${mutedXs}`}>Gång {walk} min · {transfers} byten</div>
          </div>

          <div className="shrink-0 text-right">
            <div className={metaText}>Gå senast</div>
            <div className="mt-2 text-2xl font-semibold leading-none">{data.recommendedLeaveAt ?? "—"}</div>
            <div className={`mt-3 ${smallText}`}>{leaveMin != null ? `Gå om ${leaveMin} min` : "Ingen rekommendation"}</div>
          </div>
        </div>
      </button>
    </OuterCard>
  );
}
