import type { TripSummaryResponse } from "../hooks/useJourneyPlan";
import { OuterCard } from "./CardBase";
import TransportPill from "./TransportPill";
import { sectionLabel, sectionTitle } from "./uiTokens";

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
  onSelectSegment?: (idx: number | null) => void;
  selectedIndex?: number | null;
};

export function JourneyResults({ data, onSelectSegment, selectedIndex }: Props) {
  const segments = (data.segments ?? []) as Segment[];
  const previewSegments = segments.slice(0, 4);
  const detailsOpen = selectedIndex !== null;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className={sectionLabel}>Nästa steg</div>
          <h3 className={`mt-2 ${sectionTitle}`}>Så här tar du dig fram</h3>
        </div>
        <button
          type="button"
          onClick={() => onSelectSegment?.(detailsOpen ? null : 0)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/82 transition hover:bg-white/8"
        >
          {detailsOpen ? "Dölj detaljer" : "Visa detaljer"}
        </button>
      </div>

      <OuterCard>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-cyan-100">Snabb överblick</div>
          <div className="text-xs text-white/50">Fokusera på nästa steg</div>
        </div>

        {previewSegments.length === 0 && (
          <div className="text-sm text-white/55">Inga steg tillgängliga ännu.</div>
        )}

        <div className="space-y-3">
          {previewSegments.map((segment, idx) => (
            <div
              key={`${segment.type}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <TransportPill line={segment.line} mode={segment.mode} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-white">
                    {segment.mode ?? segment.type ?? "Steg"} {segment.line ? segment.line : ""}
                  </div>
                  <div className="truncate text-xs text-white/55">
                    {[segment.from, segment.to].filter(Boolean).join(" → ") || "Ressteg"}
                  </div>
                </div>
              </div>

              <div className="shrink-0 font-mono text-sm font-semibold text-white/66">
                {segment.durationMinutes ?? "-"} min
              </div>
            </div>
          ))}
        </div>
      </OuterCard>
    </div>
  );
}

export default JourneyResults;
