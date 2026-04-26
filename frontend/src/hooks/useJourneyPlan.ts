import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export type JourneyPlanRequest = {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
};

export type TripRoute = {
  departureTime?: string | null;
  arrivalTime?: string | null;
  mode?: string | null;
  line?: string | null;
  toward?: string | null;
  boardingName?: string | null;
  destinationName?: string | null;
  platform?: string | null;
};

export type TripSummaryResponse = {
  plannedDurationMinutes?: number | null;
  realtimeDurationMinutes?: number | null;
  walkingDurationMinutes?: number | null;
  realisticDurationMinutes?: number | null;
  recommendedLeaveAt?: string | null;
  recommendedLeaveInMinutes?: number | null;
  transfers?: number | null;
  route?: TripRoute | null;
  insights?: unknown;
  segments?: unknown[];
  stops?: unknown[];
  stationTiming?: unknown;
  polyline?: { lat: number; lng: number }[]; // optional
};

export function useJourneyPlan() {
  return useMutation<TripSummaryResponse, Error, JourneyPlanRequest>({
    mutationFn: (req: JourneyPlanRequest) =>
      apiFetch<TripSummaryResponse>("/api/plans/journey", {
        method: "POST",
        body: JSON.stringify(req),
      }),
  });
}
