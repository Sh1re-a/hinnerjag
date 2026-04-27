import type {
  JourneySegment,
  JourneyStop,
  StationTiming,
  TripSummaryResponse,
} from "../hooks/useJourneyPlan";
import { getStatusFromLeave } from "../components/boardUi";

export type JourneyInsightItem = {
  title: string;
  detail: string;
  badge?: string;
  tone: "emerald" | "sky" | "slate";
};

type TimelineItem = {
  time: string;
  label: string;
  detail: string;
  kind: "walk" | "station" | "arrival";
};

export function getJourneyHeader(
  data: TripSummaryResponse,
  originLabel?: string,
  destinationLabel?: string,
) {
  const route = data.route ?? {};
  const from = normalizeJourneyPlace(
    originLabel ?? firstSegmentFrom(data) ?? route.boardingName,
    "Din plats",
  );
  const to = getDisplayPlace(destinationLabel ?? lastSegmentTo(data) ?? route.destinationName, "Din destination");
  const duration = data.plannedDurationMinutes ?? data.realisticDurationMinutes ?? null;
  const mode = route.mode ?? "Resa";
  const line = route.line ? `${mode} ${route.line}` : mode;
  const realtime = data.realtimeDurationMinutes != null && data.plannedDurationMinutes != null
    ? Math.max(0, data.realtimeDurationMinutes - data.plannedDurationMinutes)
    : null;

  return {
    from,
    to,
    title: `${from} → ${to}`,
    meta: [
      duration != null ? `${duration} min` : null,
      data.insights?.realtimeControlled ? "Realtid" : null,
      `${data.transfers ?? 0} byten`,
      line,
    ].filter(Boolean) as string[],
    realtimeDeltaLabel: realtime == null ? null : `±${realtime} min`,
  };
}

export function getJourneyInsights(data: TripSummaryResponse): JourneyInsightItem[] {
  const items: JourneyInsightItem[] = [];
  const route = data.route ?? {};
  const insights = data.insights ?? {};
  const timing = data.stationTiming ?? {};

  const occupancyLabel = formatOccupancy(insights.occupancy);
  if (occupancyLabel) {
    items.push({
      title: occupancyLabel.title,
      detail: occupancyLabel.detail(route),
      badge: occupancyLabel.badge,
      tone: "emerald",
    });
  }

  if (insights.alerts && insights.alerts.length > 0) {
    items.push({
      title: "Trafikinfo",
      detail: insights.alerts[0],
      badge: `${insights.alerts.length} varning${insights.alerts.length > 1 ? "ar" : ""}`,
      tone: "sky",
    });
  } else {
    items.push({
      title: "Inga störningar",
      detail: "All trafik rullar på som vanligt.",
      tone: "slate",
    });
  }

  const timingItem = formatTimingInsight(timing);
  if (timingItem) {
    items.push(timingItem);
  }

  return items.slice(0, 3);
}

export function getJourneyFacts(data: TripSummaryResponse) {
  const route = data.route ?? {};
  const stops = data.stops ?? [];

  return [
    { label: "Planerad restid", value: minutesLabel(data.plannedDurationMinutes) },
    { label: "Realtidsjustering", value: deltaLabel(data.realtimeDurationMinutes, data.plannedDurationMinutes) },
    { label: "Total restid", value: minutesLabel(data.realisticDurationMinutes ?? data.plannedDurationMinutes) },
    { label: "Rekommenderad avgång", value: data.recommendedLeaveAt ?? "—" },
    { label: "Byten", value: String(data.transfers ?? 0) },
    { label: "Linje", value: route.line ?? "—" },
    { label: "Riktning", value: route.toward ?? "—" },
    { label: "Plattform", value: route.platform ?? "—" },
    { label: "Stopp", value: String(Math.max(0, stops.length - 1)) },
  ];
}

export function getTransitStops(data: TripSummaryResponse): JourneyStop[] {
  const stops = data.stops ?? [];
  if (stops.length === 0) return [];
  return stops;
}

export function getTimeline(data: TripSummaryResponse, originLabel?: string, destinationLabel?: string) {
  const segments = data.segments ?? [];
  const route = data.route ?? {};
  const transitStops = getTransitStops(data);
  const firstWalk = segments.find((segment) => segment.type === "WALK") ?? null;
  const lastWalk = [...segments].reverse().find((segment) => segment.type === "WALK") ?? null;
  const firstTransit = segments.find((segment) => segment.type === "TRANSIT") ?? null;
  const status = getStatusFromLeave(data.recommendedLeaveInMinutes ?? null);

  const items: TimelineItem[] = [];

  if (firstWalk && route.departureTime) {
    items.push({
      time: shiftTime(route.departureTime, -(firstWalk.durationMinutes ?? 0)) ?? route.departureTime,
      label: normalizeJourneyPlace(originLabel ?? firstWalk.from, "Din plats"),
      detail: `Gå ${minutesLabel(firstWalk.durationMinutes)} till ${getDisplayPlace(firstWalk.to, "stationen")}`,
      kind: "walk",
    });
  }

  if (firstTransit && route.departureTime) {
    items.push({
      time: route.departureTime,
      label: getDisplayPlace(firstTransit.from ?? route.boardingName, "Påstigning"),
      detail: route.platform ? `Plattform ${route.platform}` : "Gå till plattformen",
      kind: "station",
    });
  }

  if (firstTransit && route.arrivalTime) {
    items.push({
      time: route.arrivalTime,
      label: getDisplayPlace(firstTransit.to ?? route.destinationName, "Avstigning"),
      detail: route.platform ? `Ankomst plattform ${route.platform}` : "Kliv av här",
      kind: "station",
    });
  }

  if (lastWalk && route.arrivalTime) {
    items.push({
      time: shiftTime(route.arrivalTime, lastWalk.durationMinutes ?? 0) ?? route.arrivalTime,
      label: getDisplayPlace(destinationLabel ?? lastWalk.to, "Framme"),
      detail: `Gå ${minutesLabel(lastWalk.durationMinutes)} till destination`,
      kind: "arrival",
    });
  }

  return {
    items,
    transitStops,
    transitLine: route.line ?? null,
    transitDirection: route.toward ?? null,
    transitWindow: route.departureTime && route.arrivalTime ? `${route.departureTime}–${route.arrivalTime}` : null,
    transitDurationLabel: firstTransit ? minutesLabel(firstTransit.durationMinutes) : null,
    transitStopCount: Math.max(0, transitStops.length - 1),
    walkingLabel: minutesLabel(data.walkingDurationMinutes),
    totalLabel: minutesLabel(data.plannedDurationMinutes),
    arrivalStatus: status.label,
  };
}

export function getSummarySteps(data: TripSummaryResponse) {
  const segments = data.segments ?? [];

  return segments.map((segment) => ({
    label: buildStepLabel(segment),
    detail: buildStepDetail(segment),
    durationLabel: minutesLabel(segment.durationMinutes),
    line: segment.line,
    mode: segment.mode,
  }));
}

function buildStepLabel(segment: JourneySegment) {
  if (segment.type === "WALK") return "Gång";
  if (segment.mode && segment.line) return `${segment.mode} ${segment.line}`;
  return segment.mode ?? segment.type ?? "Ressteg";
}

function buildStepDetail(segment: JourneySegment) {
  if (segment.type === "WALK") {
    return `${normalizeJourneyPlace(segment.from, "Din plats")} → ${getDisplayPlace(segment.to, "Framme")}`;
  }

  const direction = segment.toward ? `Mot ${segment.toward}` : null;
  const platform = segment.platform ? `Spår ${segment.platform}` : null;
  return [direction, platform].filter(Boolean).join(" · ") || `${getDisplayPlace(segment.from, "Påstigning")} → ${getDisplayPlace(segment.to, "Avstigning")}`;
}

function formatOccupancy(occupancy?: string | null) {
  if (!occupancy) return null;

  if (occupancy === "MANY_SEATS") {
    return {
      title: "Många sittplatser",
      badge: "Lugnt nu",
      detail: (route: TripSummaryResponse["route"]) =>
        `${route?.mode ?? "Resan"} ${route?.line ?? ""} har gott om plats just nu.`.trim(),
    };
  }

  if (occupancy === "STANDING_ROOM_ONLY") {
    return {
      title: "Mycket folk",
      badge: "Fullt",
      detail: (route: TripSummaryResponse["route"]) =>
        `${route?.mode ?? "Resan"} ${route?.line ?? ""} är ganska full just nu.`.trim(),
    };
  }

  return {
    title: "Normal beläggning",
    badge: "Realtid",
    detail: (route: TripSummaryResponse["route"]) =>
      `${route?.mode ?? "Resan"} ${route?.line ?? ""} ser normal ut just nu.`.trim(),
  };
}

function formatTimingInsight(timing: StationTiming): JourneyInsightItem | null {
  if (timing.boardingMinutes != null) {
    return {
      title: "Bra marginal till tåget",
      detail: "Normal marginal till plattformen innan avgång.",
      badge: `${timing.boardingMinutes} min till plattform`,
      tone: "sky",
    };
  }

  if (timing.arrivalMinutes != null) {
    return {
      title: "Lite gång efter ankomst",
      detail: "Räkna med lite längre gång efter att du klivit av.",
      badge: `${timing.arrivalMinutes} min efter ankomst`,
      tone: "slate",
    };
  }

  return null;
}

function deltaLabel(realtime?: number | null, planned?: number | null) {
  if (realtime == null || planned == null) return "—";
  const diff = realtime - planned;
  return diff === 0 ? "±0 min" : `${diff > 0 ? "+" : ""}${diff} min`;
}

function minutesLabel(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${minutes} min`;
}

function firstSegmentFrom(data: TripSummaryResponse) {
  return data.segments?.[0]?.from ?? null;
}

function lastSegmentTo(data: TripSummaryResponse) {
  const segments = data.segments ?? [];
  return segments.length > 0 ? segments[segments.length - 1]?.to ?? null : null;
}

function getDisplayPlace(value?: string | null, fallback = "—") {
  if (!value) return fallback;
  return value.split(",")[0].trim();
}

function normalizeJourneyPlace(value?: string | null, fallback = "—") {
  const display = getDisplayPlace(value, fallback);
  return isCoordinateLabel(display) ? fallback : display;
}

function isCoordinateLabel(value: string) {
  return /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(value);
}

function shiftTime(time: string, deltaMinutes: number) {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const shifted = hour * 60 + minute + deltaMinutes;
  const safeMinutes = ((shifted % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(safeMinutes / 60);
  const nextMinute = safeMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}
