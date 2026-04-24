import type { Departure, Reachability } from "../hooks/useNearbyBoard";

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
    return "text-emerald-400";
  }

  if (status === "TIGHT") {
    return "text-amber-300";
  }

  return "text-rose-400";
}

export function getStatusBadgeTone(status: Reachability["status"] | undefined) {
  if (status === "SAFE") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "TIGHT") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-rose-500/20 bg-rose-500/10 text-rose-300";
}

export function formatDistance(distanceMeters: number) {
  return `${Math.round(distanceMeters)} m`;
}

export function getLineTone(departure: Departure) {
  if (departure.transportMode === "BUS") {
    return "bg-rose-500 text-white";
  }

  if (departure.line === "10" || departure.line === "11") {
    return "bg-blue-600 text-white";
  }

  if (departure.line === "13" || departure.line === "14") {
    return "bg-rose-600 text-white";
  }

  if (
    departure.line === "17" ||
    departure.line === "18" ||
    departure.line === "19"
  ) {
    return "bg-emerald-600 text-white";
  }

  return "bg-slate-600 text-white";
}
