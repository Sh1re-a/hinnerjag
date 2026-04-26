import type { TripSummaryResponse } from "../hooks/useJourneyPlan";

type Stop = {
  name?: string | null;
  arrivalTime?: string | null;
  departureTime?: string | null;
  platform?: string | null;
};

type Props = {
  data: TripSummaryResponse;
  segmentIndex: number;
};

export function JourneyDetail({ data, segmentIndex }: Props) {
  const stops = (data.stops ?? []) as Stop[];

  if (stops.length === 0) {
    return <div className="text-xs text-white/50 mt-2">Inga hållplatser tillgängliga</div>;
  }

  return (
    <div className="mt-3 rounded-lg bg-white/3 p-3">
      <div className="text-sm font-semibold mb-2">Resesteg — Del {segmentIndex + 1}</div>
      <ul className="space-y-2">
        {stops.map((s, i) => (
          <li key={`${s.name}-${i}`} className="flex items-center justify-between">
            <div>
              <div className="text-sm">{s.name}</div>
              <div className="text-xs text-white/60">Avgång: {s.departureTime ?? "-"} · Ankomst: {s.arrivalTime ?? "-"}</div>
            </div>
            <div className="text-xs text-white/50">Plattform: {s.platform ?? "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JourneyDetail;
