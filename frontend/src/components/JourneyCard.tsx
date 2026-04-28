import type { JourneyTrip } from "../hooks/useJourneyPlan";
import { getStatusBadgeTone } from "./boardUi";
import { OuterCard } from "./CardBase";
import { badgeBase, metaText, mutedXs, smallText } from "./uiTokens";
import { getLiveJourneyStatus } from "../lib/journeyUi";

type Props = {
  data: JourneyTrip;
  variant?: "summary" | "option";
  isSelected?: boolean;
  onSelect?: () => void;
  optionLabel?: string | null;
  currentTimeMs?: number;
};

export default function JourneyCard({
  data,
  variant = "option",
  isSelected,
  onSelect,
  optionLabel,
  currentTimeMs = Date.now(),
}: Props) {
  const route = data.route ?? {};
  const leaveMin = data.recommendedLeaveInMinutes ?? null;
  const liveStatus = getLiveJourneyStatus(data, currentTimeMs);
  const statusKey =
    liveStatus.key === "SAFE" ? "SAFE" : liveStatus.key === "TIGHT" ? "TIGHT" : "MISS";
  const duration = data.realisticDurationMinutes ?? data.plannedDurationMinutes ?? "-";
  const transfers = data.transfers ?? 0;
  const walk = data.walkingDurationMinutes ?? 0;
  const arrival = route.arrivalTime ?? "—";
  const leaveLabel = liveStatus.leaveLabel;

  if (variant === "summary") {
    return (
      <OuterCard>
        <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-md bg-white/[0.02]">
          <div className="px-3 py-3">
            <div className={metaText}>{liveStatus.leaveFieldLabel}</div>
            <div className="mt-2 text-[26px] font-semibold leading-none text-white">{data.recommendedLeaveAt ?? "—"}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`${badgeBase} ${getStatusBadgeTone(statusKey)}`}>{leaveLabel}</span>
            </div>
            <div className={`mt-2 ${smallText}`}>För att hinna i tid</div>
          </div>

          <div className="border-l border-white/8 px-3 py-3">
            <div className={metaText}>Framme</div>
            <div className="mt-2 text-[26px] font-semibold leading-none text-emerald-300">{arrival}</div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-[12px] font-semibold ${
                  statusKey === "SAFE"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : statusKey === "TIGHT"
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-300"
                }`}
              >
                {liveStatus.summaryLabel}
              </span>
            </div>
            <div className={`mt-2 ${smallText}`}>Inom {duration} min</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/6 pt-3">
          <div className={smallText}>{route.departureTime ?? "—"} → {route.arrivalTime ?? "—"}</div>
          <div className={smallText}>Gång {walk} min</div>
          <div className={smallText}>{transfers} byten</div>
        </div>
      </OuterCard>
    );
  }

  return (
    <OuterCard innerClassName={isSelected ? "border border-emerald-400/25 bg-emerald-500/[0.03]" : ""}>
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left opacity-95 hover:opacity-100"
        aria-pressed={isSelected}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
            {isSelected && (
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Vald resa
              </span>
            )}
              {!isSelected && optionLabel && (
                <span className="inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
                  {optionLabel}
                </span>
              )}
              <span className={`${badgeBase} ${getStatusBadgeTone(statusKey)}`}>{liveStatus.label}</span>
            </div>
            <div className={metaText}>{route.departureTime ?? "—"} → {route.arrivalTime ?? "—"}</div>
            <div className="mt-2 text-[24px] font-semibold leading-none text-white">{duration} min</div>
            <div className={`mt-2 ${mutedXs}`}>Gång {walk} min · {transfers} byten</div>
          </div>

          <div className="shrink-0 text-right">
            <div className={metaText}>{liveStatus.leaveFieldLabel}</div>
            <div className="mt-2 text-[20px] font-semibold leading-none">{data.recommendedLeaveAt ?? "—"}</div>
            <div className={`mt-2 ${smallText}`}>{leaveMin != null ? leaveLabel : "Ingen rekommendation"}</div>
          </div>
        </div>
      </button>
    </OuterCard>
  );
}
