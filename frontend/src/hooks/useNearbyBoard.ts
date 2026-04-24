import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { PositionState } from "./useCurrentPosition";

export type Reachability = {
  minutesUntilDeparture: number;
  recommendedGoNow: boolean;
  recommendedWalkInMinutes: number;
  marginMinutes: number;
  status: "SAFE" | "TIGHT" | "MISS";
};

export type Departure = {
  line: string | null;
  destination: string | null;
  display: string | null;
  transportMode: string | null;
  reachability: Reachability | null;
};

export type Access = {
  walkMinutes: number;
  bufferMinutes: number;
  recommendedAccessMinutes: number;
  reason: string;
};

export type NearbySite = {
  siteId: number;
  siteName: string;
  distanceMeters: number;
  access: Access;
  departures: Departure[];
};

export type NearbyBoardResponse = {
  userLat: number;
  userLng: number;
  nearestMetro: NearbySite | null;
  nearbyBusStops: NearbySite[];
};

export function useNearbyBoard(position: PositionState | null) {
  return useQuery({
    queryKey: ["nearby-board", position?.lat, position?.lng],
    queryFn: () =>
      apiFetch<NearbyBoardResponse>(
        `/api/board/nearby?lat=${position!.lat}&lng=${position!.lng}`,
      ),
    enabled: Boolean(position),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: 30_000,
  });
}