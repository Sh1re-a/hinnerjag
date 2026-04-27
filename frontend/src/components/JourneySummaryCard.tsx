import JourneyCard from "./JourneyCard";
import type { TripSummaryResponse } from "../hooks/useJourneyPlan";

type Props = {
  data: TripSummaryResponse | null;
};

export function JourneySummaryCard({ data }: Props) {
  if (!data) return null;
  return <JourneyCard data={data} variant="summary" />;
}

export default JourneySummaryCard;
