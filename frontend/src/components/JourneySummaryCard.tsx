import JourneyCard from "./JourneyCard";
import type { JourneyTrip } from "../hooks/useJourneyPlan";

type Props = {
  data: JourneyTrip | null;
};

export function JourneySummaryCard({ data }: Props) {
  if (!data) return null;
  return <JourneyCard data={data} variant="summary" />;
}

export default JourneySummaryCard;
