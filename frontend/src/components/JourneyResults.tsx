import type { TripSummaryResponse } from "../hooks/useJourneyPlan";
import { OuterCard } from "./CardBase";
import TransportPill from "./TransportPill";
import { sectionLabel, sectionTitle, subtleButton } from "./uiTokens";
import { getJourneyInsights, getSummarySteps } from "../lib/journeyUi";

type Props = {
  data: TripSummaryResponse;
  onSelectSegment?: (idx: number | null) => void;
  selectedIndex?: number | null;
};

export function JourneyResults({ data, onSelectSegment, selectedIndex }: Props) {
  const previewSegments = getSummarySteps(data);
  const insights = getJourneyInsights(data);
  const detailsOpen = selectedIndex !== null;

  return (
    <div className="mt-4 space-y-3">
      <OuterCard>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className={sectionLabel}>Tips</div>
            <h3 className={`mt-1 ${sectionTitle}`}>Bra att veta innan du går</h3>
          </div>
          <div className="text-[11px] text-white/45">Realtid och marginal</div>
        </div>

        <div className="divide-y divide-white/6">
          {insights.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start justify-between gap-3 py-2 ${index === 0 ? "pt-1" : ""}`}
            >
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-[13px] leading-snug text-white/58">{item.detail}</div>
              </div>
              {item.badge && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    item.tone === "emerald"
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : item.tone === "sky"
                        ? "border border-sky-500/20 bg-sky-500/10 text-sky-300"
                        : "border border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </OuterCard>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={sectionLabel}>Resan i korthet</div>
          <h3 className={`mt-2 ${sectionTitle}`}>Så här tar du dig fram</h3>
        </div>
        <button
          type="button"
          onClick={() => onSelectSegment?.(detailsOpen ? null : 0)}
          className={subtleButton}
        >
          {detailsOpen ? "Dölj detaljer" : "Visa detaljer"}
        </button>
      </div>

      <OuterCard>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-cyan-100">Tre tydliga steg</div>
          <div className="text-[11px] text-white/50">Fokusera på nästa steg</div>
        </div>

        {previewSegments.length === 0 && (
          <div className="text-sm text-white/55">Inga steg tillgängliga ännu.</div>
        )}

        <div className="divide-y divide-white/6">
          {previewSegments.map((segment, idx) => (
            <div
              key={`${segment.label}-${idx}`}
              className="flex items-start justify-between gap-3 py-2.5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex min-h-8 w-6 flex-col items-center">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  {idx < previewSegments.length - 1 && <div className="mt-2 w-px flex-1 bg-white/10" />}
                </div>
                <TransportPill line={segment.line} mode={segment.mode} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-white">
                    {segment.label}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-white/60">
                    {segment.detail}
                  </div>
                </div>
              </div>

              <div className="shrink-0 font-mono text-[13px] font-semibold text-white/66">
                {segment.durationLabel}
              </div>
            </div>
          ))}
        </div>
      </OuterCard>
    </div>
  );
}

export default JourneyResults;
