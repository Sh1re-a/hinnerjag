import type { TripSummaryResponse } from "../hooks/useJourneyPlan";

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
  onSelectSegment?: (idx: number) => void;
};

export function JourneyResults({ data, onSelectSegment }: Props) {
  const segments = (data.segments ?? []) as Segment[];

  return (
    <div className="mt-3 space-y-2">
      <div className="text-sm text-white/60">Föreslagna segment</div>
      {segments.length === 0 && <div className="text-xs text-white/50">Inga segment tillgängliga</div>}

      {segments.map((s, idx) => (
        <button
          key={`${s.type}-${idx}`}
          type="button"
          onClick={() => onSelectSegment?.(idx)}
          className="w-full text-left rounded-lg border border-white/6 bg-white/3 p-3 hover:bg-white/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{s.mode ?? s.type ?? "Segment"} {s.line ? ` ${s.line}` : ""}</div>
              <div className="text-xs text-white/60">{s.from ?? "-"} → {s.to ?? "-"}</div>
            </div>
            <div className="text-sm text-white/60">{s.durationMinutes ?? "-"} min</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default JourneyResults;
