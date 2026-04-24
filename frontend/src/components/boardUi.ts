import type { Reachability } from "../hooks/useNearbyBoard";

export function getDepartureMessage(reachability: Reachability | null) {
  if (!reachability) {
    return "Ingen prognos";
  }

  if (reachability.status === "MISS") {
    return "Missar";
  }

  if (reachability.status === "TIGHT") {
    return reachability.recommendedGoNow
      ? "Gå nu"
      : `Gå om ${reachability.recommendedWalkInMinutes} min`;
  }

  return reachability.recommendedWalkInMinutes > 0
    ? `Gå om ${reachability.recommendedWalkInMinutes} min`
    : "Hinner";
}

export function getStatusTone(status: Reachability["status"] | undefined) {
  if (status === "SAFE") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "TIGHT") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

export function getTimeTone(status: Reachability["status"] | undefined) {
  if (status === "SAFE") {
    return "text-emerald-300";
  }

  if (status === "TIGHT") {
    return "text-amber-300";
  }

  return "text-rose-300";
}

export function formatDistance(distanceMeters: number) {
  return `${Math.round(distanceMeters)} m`;
}