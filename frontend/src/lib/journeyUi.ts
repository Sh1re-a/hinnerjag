import type {
  JourneyTrip,
  JourneySegment,
  JourneyStop,
  StationTiming,
} from "../hooks/useJourneyPlan";
import { getStatusFromLeave } from "../components/boardUi";

export type LiveJourneyStatus = {
  key: "SAFE" | "TIGHT" | "ALREADY_LEFT" | "MISS";
  label: string;
  tone: "green" | "yellow" | "red";
  leaveLabel: string;
  summaryLabel: string;
  leaveFieldLabel: string;
  leaveDiffMinutes: number | null;
};

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
  transit?: {
    line: string | null;
    direction: string | null;
    window: string | null;
    durationLabel: string | null;
    stopCount: number;
    stops: JourneyStop[];
  } | null;
};

export function getJourneyHeader(
  data: JourneyTrip,
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

export function getJourneyInsights(data: JourneyTrip): JourneyInsightItem[] {
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

export function getJourneyFacts(data: JourneyTrip) {
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

export function getTransitStops(data: JourneyTrip): JourneyStop[] {
  const stops = data.stops ?? [];
  if (stops.length === 0) return [];
  return stops;
}

export function getTimeline(data: JourneyTrip, originLabel?: string, destinationLabel?: string) {
  const segments = data.segments ?? [];
  const transitStops = getTransitStops(data);
  const transitSegments = segments.filter((segment) => segment.type === "TRANSIT");
  const status = getStatusFromLeave(data.recommendedLeaveInMinutes ?? null);
  const items: TimelineItem[] = [];
  let transitIndex = 0;

  segments.forEach((segment, index) => {
    const nextSegment = segments[index + 1] ?? null;
    const isFirst = index === 0;
    const isLast = index === segments.length - 1;

    if (segment.type === "WALK") {
      items.push({
        time: segment.departureTime ?? segment.arrivalTime ?? "—",
        label: isFirst
          ? normalizeJourneyPlace(originLabel ?? segment.from, "Din plats")
          : getDisplayPlace(segment.from, "Byte"),
        detail: isLast
          ? `Gå ${minutesLabel(segment.durationMinutes)} till ${getDisplayPlace(destinationLabel ?? segment.to, "destination")}`
          : `Gå ${minutesLabel(segment.durationMinutes)} till ${getDisplayPlace(segment.to, "stationen")}`,
        kind: isLast ? "arrival" : "walk",
        transit: null,
      });
      return;
    }

    const currentTransitIndex = transitIndex;
    transitIndex += 1;
    const hasSingleTransit = transitSegments.length === 1;

    items.push({
      time: segment.departureTime ?? "—",
      label: getDisplayPlace(segment.from, "Påstigning"),
      detail: buildTransitTimelineDetail(segment, currentTransitIndex > 0),
      kind: "station",
      transit: {
        line: segment.line ?? null,
        direction: segment.toward ?? null,
        window:
          segment.departureTime && segment.arrivalTime
            ? `${segment.departureTime}–${segment.arrivalTime}`
            : null,
        durationLabel: minutesLabel(segment.durationMinutes),
        stopCount: hasSingleTransit ? Math.max(0, transitStops.length - 1) : 0,
        stops: hasSingleTransit ? transitStops : [],
      },
    });

    items.push({
      time: segment.arrivalTime ?? "—",
      label: getDisplayPlace(segment.to, "Avstigning"),
      detail: nextSegment?.type === "TRANSIT"
        ? `Byt här till ${buildTransitName(nextSegment)}`
        : nextSegment?.type === "WALK"
          ? "Kliv av här och gå sista biten"
          : "Kliv av här",
      kind: nextSegment?.type === "TRANSIT" ? "station" : "arrival",
      transit: null,
    });
  });

  return {
    items,
    walkingLabel: minutesLabel(data.walkingDurationMinutes),
    totalLabel: minutesLabel(data.realisticDurationMinutes ?? data.plannedDurationMinutes),
    arrivalStatus: status.label,
  };
}

export function getSummarySteps(data: JourneyTrip) {
  const segments = data.segments ?? [];
  let transitIndex = 0;

  return segments.map((segment, index) => {
    const currentTransitIndex = segment.type === "TRANSIT" ? transitIndex++ : transitIndex;
    return {
    label: buildStepLabel(segment, index, currentTransitIndex),
    detail: buildStepDetail(segment, index, segments.length),
    durationLabel: minutesLabel(segment.durationMinutes),
    line: segment.line,
    mode: segment.mode,
    };
  });
}

export function getLiveJourneyStatus(data: JourneyTrip, currentTimeMs: number) {
  const fallbackLeaveMin = data.recommendedLeaveInMinutes ?? null;
  const fallbackStatus = getStatusFromLeave(fallbackLeaveMin);
  const departureAt = parseTimeNearNow(data.route?.departureTime, currentTimeMs);
  const leaveAt = parseLeaveTime(data.recommendedLeaveAt, departureAt, currentTimeMs);

  if (!leaveAt) {
    if (fallbackStatus.key === "MISS") {
      return buildLiveStatus("MISS", null, data.recommendedLeaveAt);
    }
    if (fallbackStatus.key === "TIGHT") {
      return buildLiveStatus("TIGHT", fallbackLeaveMin, data.recommendedLeaveAt);
    }
    return buildLiveStatus("SAFE", fallbackLeaveMin, data.recommendedLeaveAt);
  }

  const leaveDiffMinutes = getMinuteDiff(currentTimeMs, leaveAt.getTime());
  const departurePassed = departureAt ? currentTimeMs >= departureAt.getTime() : false;

  if (departurePassed) {
    return buildLiveStatus("MISS", leaveDiffMinutes, data.recommendedLeaveAt);
  }
  if (leaveDiffMinutes >= 2) {
    return buildLiveStatus("SAFE", leaveDiffMinutes, data.recommendedLeaveAt);
  }
  if (leaveDiffMinutes >= 0) {
    return buildLiveStatus("TIGHT", leaveDiffMinutes, data.recommendedLeaveAt);
  }
  return buildLiveStatus("ALREADY_LEFT", leaveDiffMinutes, data.recommendedLeaveAt);
}

function buildStepLabel(segment: JourneySegment, index: number, transitIndex: number) {
  if (segment.type === "WALK") {
    return `Gå till ${getDisplayPlace(index === 0 ? segment.to : segment.to, "destination")}`;
  }
  if (segment.mode && segment.line) {
    return transitIndex > 0 ? `Byt till ${segment.mode} ${segment.line}` : `Ta ${segment.mode} ${segment.line}`;
  }
  return segment.mode ?? segment.type ?? "Ressteg";
}

function buildLiveStatus(
  key: LiveJourneyStatus["key"],
  leaveDiffMinutes: number | null,
  _leaveAt?: string | null,
): LiveJourneyStatus {
  if (key === "SAFE") {
    const leaveLabel =
      leaveDiffMinutes == null ? "Du hinner" : leaveDiffMinutes > 0 ? `${leaveDiffMinutes} min kvar` : "Gå nu";
    return {
      key,
      tone: "green",
      label: "Du hinner",
      summaryLabel: "Du hinner!",
      leaveFieldLabel: "Gå senast",
      leaveLabel,
      leaveDiffMinutes,
    };
  }

  if (key === "TIGHT") {
    return {
      key,
      tone: "yellow",
      label: "Gå nu",
      summaryLabel: "Gå nu",
      leaveFieldLabel: "Gå senast",
      leaveLabel: leaveDiffMinutes == null || leaveDiffMinutes <= 0 ? "Gå nu" : `${leaveDiffMinutes} min kvar`,
      leaveDiffMinutes,
    };
  }

  if (key === "ALREADY_LEFT") {
    const lateBy = leaveDiffMinutes == null ? null : Math.abs(leaveDiffMinutes);
    return {
      key,
      tone: "red",
      label: "Du missar",
      summaryLabel: "Om du inte redan gått, missar du",
      leaveFieldLabel: "Skulle gått",
      leaveLabel: lateBy == null ? "för sent" : `${lateBy} min för sent`,
      leaveDiffMinutes,
    };
  }

  return {
    key,
    tone: "red",
    label: "Du missar",
    summaryLabel: "Du missar",
    leaveFieldLabel: "Skulle gått",
    leaveLabel: "för sent",
    leaveDiffMinutes,
  };
}

function buildStepDetail(segment: JourneySegment, index: number, totalSegments: number) {
  if (segment.type === "WALK") {
    if (index === 0) {
      return `Från ${normalizeJourneyPlace(segment.from, "Din plats")}`;
    }
    if (index === totalSegments - 1) {
      return `Sista biten från ${getDisplayPlace(segment.from, "stationen")}`;
    }
    return `Gå mellan ${getDisplayPlace(segment.from, "byte")} och ${getDisplayPlace(segment.to, "nästa byte")}`;
  }

  const parts = [
    `${getDisplayPlace(segment.from, "Påstigning")} → ${getDisplayPlace(segment.to, "Avstigning")}`,
    segment.toward ? `Mot ${segment.toward}` : null,
    segment.platform ? `Spår ${segment.platform}` : null,
  ];
  return parts.filter(Boolean).join(" · ");
}

function formatOccupancy(occupancy?: string | null) {
  if (!occupancy) return null;

  if (occupancy === "MANY_SEATS") {
    return {
      title: "Många sittplatser",
      badge: "Lugnt nu",
      detail: (route: JourneyTrip["route"]) =>
        `${route?.mode ?? "Resan"} ${route?.line ?? ""} har gott om plats just nu.`.trim(),
    };
  }

  if (occupancy === "STANDING_ROOM_ONLY") {
    return {
      title: "Mycket folk",
      badge: "Fullt",
      detail: (route: JourneyTrip["route"]) =>
        `${route?.mode ?? "Resan"} ${route?.line ?? ""} är ganska full just nu.`.trim(),
    };
  }

  return {
    title: "Normal beläggning",
    badge: "Realtid",
    detail: (route: JourneyTrip["route"]) =>
      `${route?.mode ?? "Resan"} ${route?.line ?? ""} ser normal ut just nu.`.trim(),
  };
}

function parseLeaveTime(
  leaveTime?: string | null,
  departureAt?: Date | null,
  currentTimeMs?: number,
) {
  if (!leaveTime) return null;

  if (departureAt) {
    const [hours, minutes] = leaveTime.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    const candidate = new Date(departureAt);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate.getTime() - departureAt.getTime() > 6 * 60 * 60 * 1000) {
      candidate.setDate(candidate.getDate() - 1);
    }

    return candidate;
  }

  return parseTimeNearNow(leaveTime, currentTimeMs ?? Date.now());
}

function parseTimeNearNow(time?: string | null, currentTimeMs: number = Date.now()) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const now = new Date(currentTimeMs);
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);

  const diffMs = candidate.getTime() - currentTimeMs;
  if (diffMs < -12 * 60 * 60 * 1000) {
    candidate.setDate(candidate.getDate() + 1);
  } else if (diffMs > 12 * 60 * 60 * 1000) {
    candidate.setDate(candidate.getDate() - 1);
  }

  return candidate;
}

function getMinuteDiff(currentTimeMs: number, targetTimeMs: number) {
  const diffSeconds = Math.round((targetTimeMs - currentTimeMs) / 1000);

  if (diffSeconds >= 0) {
    return Math.ceil(diffSeconds / 60);
  }

  return Math.floor(diffSeconds / 60);
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

function firstSegmentFrom(data: JourneyTrip) {
  return data.segments?.[0]?.from ?? null;
}

function lastSegmentTo(data: JourneyTrip) {
  const segments = data.segments ?? [];
  return segments.length > 0 ? segments[segments.length - 1]?.to ?? null : null;
}

function buildTransitName(segment?: JourneySegment | null) {
  if (!segment) return "nästa resa";
  if (segment.mode && segment.line) return `${segment.mode} ${segment.line}`;
  return segment.mode ?? "nästa resa";
}

function buildTransitTimelineDetail(segment: JourneySegment, isTransfer: boolean) {
  const action = isTransfer ? `Byt till ${buildTransitName(segment)}` : `Ta ${buildTransitName(segment)}`;
  const parts = [
    action,
    segment.toward ? `Mot ${segment.toward}` : null,
    segment.platform ? `Spår ${segment.platform}` : null,
  ];
  return parts.filter(Boolean).join(" · ");
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
