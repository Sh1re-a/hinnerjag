import type { JourneySegment, JourneyStop, JourneyTrip } from "../hooks/useJourneyPlan";
import { CheckCircle2, Clock3, Footprints, Route, Users } from "lucide-react";
import { OuterCard } from "./CardBase";
import TransportPill from "./TransportPill";
import { sectionLabel, sectionTitle } from "./uiTokens";
import { getJourneyInsights, getLiveJourneyStatus } from "../lib/journeyUi";
import JourneyCard from "./JourneyCard";

type Props = {
  data: JourneyTrip;
  options?: JourneyTrip[];
  selectedOptionIndex?: number;
  onSelectOption?: (idx: number) => void;
  currentTimeMs?: number;
  originLabel?: string;
  destinationLabel?: string;
};

export function JourneyResults({
  data,
  options = [],
  selectedOptionIndex = 0,
  onSelectOption,
  currentTimeMs = Date.now(),
  originLabel,
  destinationLabel,
}: Props) {
  const insights = getJourneyInsights(data);
  const optionLabels = buildOptionLabels(options);
  const status = getLiveJourneyStatus(data, currentTimeMs);
  const leaveText = getLeaveText(data.recommendedLeaveAt, status.leaveLabel, status.leaveFieldLabel);
  const overviewSteps = buildOverviewSteps(data, originLabel, destinationLabel);
  const footerTotal = data.realtimeDurationMinutes ?? data.plannedDurationMinutes;
  const helperNote = buildHelperNote(data);
  return (
    <div className="mt-4 space-y-3">
      {options.length > 1 && (
        <div className="space-y-2">
          <div>
            <div className={sectionLabel}>Fler resor</div>
            <h3 className={`mt-1 ${sectionTitle}`}>Välj en resa</h3>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <JourneyCard
                key={`${option.route?.departureTime ?? "trip"}-${index}`}
                data={option}
                variant="option"
                isSelected={selectedOptionIndex === index}
                optionLabel={optionLabels[index] ?? null}
                onSelect={() => onSelectOption?.(index)}
                currentTimeMs={currentTimeMs}
              />
            ))}
          </div>
        </div>
      )}

      <OuterCard innerClassName="rounded-[18px] border border-white/10 bg-white/[0.02] p-2.5">
        <div className={sectionLabel}>Resan i korthet</div>

        <div
          className={`mt-2.5 rounded-[16px] border px-3 py-2 ${
            status.tone === "green"
              ? "border-emerald-500/20 bg-emerald-500/10"
              : status.tone === "yellow"
                ? "border-amber-500/20 bg-amber-500/10"
                : "border-rose-500/20 bg-rose-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                status.tone === "green"
                  ? "bg-emerald-400 text-[#06281c]"
                  : status.tone === "yellow"
                    ? "bg-amber-400 text-[#2b1a04]"
                    : "bg-rose-400 text-[#2f0911]"
              }`}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div
                className={`text-[13px] font-semibold ${
                  status.tone === "green"
                    ? "text-emerald-300"
                    : status.tone === "yellow"
                      ? "text-amber-300"
                      : "text-rose-300"
                }`}
              >
                  {status.label}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/86">{leaveText}</div>
                {helperNote && <div className="mt-1 text-[10px] leading-snug text-white/52">{helperNote}</div>}
              </div>
            </div>
        </div>

        {overviewSteps.length === 0 && (
          <div className="mt-3 text-sm text-white/55">Inga steg tillgängliga ännu.</div>
        )}

        <div className="mt-2.5 space-y-1.5">
          {overviewSteps.map((segment, idx) => (
            <div key={`${segment.title}-${idx}`}>
              <div className="rounded-[14px] border border-white/10 bg-white/[0.018] px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] ${
                        segment.kind === "walk" ? "bg-emerald-500/16" : "bg-sky-500/12"
                      }`}
                    >
                      {segment.kind === "walk" ? (
                        <Footprints className="h-4.5 w-4.5 text-emerald-300" />
                      ) : (
                        <TransportPill line={segment.line} mode={segment.mode} size="sm" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold leading-snug text-white">{segment.title}</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-white/56">{segment.subtitle}</div>
                      {segment.note && (
                        <div className="mt-1 text-[10px] leading-snug text-white/47">{segment.note}</div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`shrink-0 pt-0.5 text-right font-mono text-[14px] font-semibold ${
                      segment.kind === "walk" ? "text-emerald-300" : "text-sky-300"
                    }`}
                  >
                    {segment.duration}
                  </div>
                </div>

                {segment.meta && (
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/6 pt-2">
                    <div>
                      <div className="text-[10px] text-white/38">Avgår</div>
                      <div className="mt-0.5 text-[12px] font-semibold text-white">{segment.departureTime ?? "—"}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-white/38">{segment.stopCountLabel ?? "Resa"}</div>
                      <div className="mt-0.5 text-[10px] text-white/62">{segment.restLabel}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/38">Framme</div>
                      <div className="mt-0.5 text-[12px] font-semibold text-white">{segment.arrivalTime ?? "—"}</div>
                    </div>
                  </div>
                )}
              </div>

              {segment.connectorText && (
                <div className="px-3 py-1 text-[10px] text-white/44">
                  {segment.connectorText}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-[14px] border border-white/10 bg-white/[0.018] px-3 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white/55">
              <Clock3 className="h-4 w-4" />
              <span className="text-[11px]">Total restid</span>
            </div>
            <div className="mt-1 text-[15px] font-semibold text-emerald-300">{minutesLabel(footerTotal)}</div>
            <div className="mt-0.5 text-[11px] text-white/45">inkl. gång</div>
          </div>
          <div className="min-w-0 border-x border-white/6 px-3">
            <div className="flex items-center gap-2 text-white/55">
              <Route className="h-4 w-4" />
              <span className="text-[11px]">Gångtid</span>
            </div>
            <div className="mt-1 text-[15px] font-semibold text-white">{minutesLabel(data.walkingDurationMinutes)}</div>
            <div className="mt-0.5 text-[11px] text-white/45">från din data</div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white/55">
              <Users className="h-4 w-4" />
              <span className="text-[11px]">Byten</span>
            </div>
            <div className="mt-1 text-[15px] font-semibold text-white">{data.transfers ?? 0}</div>
            <div className="mt-0.5 text-[11px] text-white/45">{(data.transfers ?? 0) === 0 ? "Inga byten" : "Byten i resan"}</div>
          </div>
        </div>
      </OuterCard>

      <OuterCard>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className={sectionLabel}>Tips</div>
            <h3 className={`mt-1 ${sectionTitle}`}>Bra att veta innan du går</h3>
          </div>
          <div className="text-[11px] text-white/45">Realtid och marginal</div>
        </div>

        <div className="divide-y divide-white/6">
          {insights.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start justify-between gap-3 py-2 ${index === 0 ? "pt-1" : ""}`}
            >
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-[13px] leading-snug text-white/58">{item.detail}</div>
              </div>
              {item.badge && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    item.tone === "emerald"
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : item.tone === "sky"
                        ? "border border-sky-500/20 bg-sky-500/10 text-sky-300"
                        : "border border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </OuterCard>
    </div>
  );
}

export default JourneyResults;

function buildOptionLabels(options: JourneyTrip[]) {
  if (options.length === 0) return [];

  const minDuration = Math.min(
    ...options.map((option) => option.realisticDurationMinutes ?? option.plannedDurationMinutes ?? Number.MAX_SAFE_INTEGER),
  );
  const minTransfers = Math.min(...options.map((option) => option.transfers ?? Number.MAX_SAFE_INTEGER));
  const minWalking = Math.min(...options.map((option) => option.walkingDurationMinutes ?? Number.MAX_SAFE_INTEGER));
  const durationCount = options.filter(
    (option) => (option.realisticDurationMinutes ?? option.plannedDurationMinutes ?? Number.MAX_SAFE_INTEGER) === minDuration,
  ).length;
  const transferCount = options.filter((option) => (option.transfers ?? Number.MAX_SAFE_INTEGER) === minTransfers).length;
  const walkingCount = options.filter(
    (option) => (option.walkingDurationMinutes ?? Number.MAX_SAFE_INTEGER) === minWalking,
  ).length;

  return options.map((option) => {
    if (
      durationCount === 1 &&
      (option.realisticDurationMinutes ?? option.plannedDurationMinutes ?? Number.MAX_SAFE_INTEGER) === minDuration
    ) {
      return "Kortast tid";
    }
    if (transferCount === 1 && (option.transfers ?? Number.MAX_SAFE_INTEGER) === minTransfers) {
      return "Minst byten";
    }
    if (walkingCount === 1 && (option.walkingDurationMinutes ?? Number.MAX_SAFE_INTEGER) === minWalking) {
      return "Mindre gång";
    }
    return null;
  });
}

function getLeaveText(leaveAt?: string | null, leaveLabel?: string, leaveFieldLabel?: string) {
  const time = leaveAt ?? "—";
  const prefix = leaveFieldLabel === "Skulle gått" ? "Skulle gått senast" : "Gå senast";

  if (!leaveLabel) {
    return `${prefix} ${time}`;
  }

  return `${prefix} ${time} · ${leaveLabel}`;
}

function buildHelperNote(data: JourneyTrip) {
  const noteParts: string[] = [];

  if (data.insights?.realtimeControlled) {
    noteParts.push("Realtid aktiv");
  }

  if (data.stationTiming?.boardingMinutes != null) {
    noteParts.push(`${data.stationTiming.boardingMinutes} min till plattform`);
  } else if (data.stationTiming?.arrivalMinutes != null) {
    noteParts.push(`${data.stationTiming.arrivalMinutes} min från station till mål`);
  }

  if (data.insights?.occupancy === "MANY_SEATS") {
    noteParts.push("Gott om sittplatser");
  }

  return noteParts.join(" · ");
}

function buildOverviewSteps(data: JourneyTrip, originLabel?: string, destinationLabel?: string) {
  const segments = data.segments ?? [];
  const steps: Array<{
    kind: "walk" | "transit";
    mode: string;
    line: string | null;
    title: string;
    subtitle: string;
    note: string | null;
    connectorText: string | null;
    meta: boolean | null;
    duration: string;
    departureTime: string | null;
    arrivalTime: string | null;
    stopCountLabel: string | null;
    restLabel: string | null;
  }> = [];

  if (
    segments.length > 0 &&
    segments[0]?.type === "TRANSIT" &&
    data.route?.boardingName &&
    originLabel &&
    data.stationTiming?.boardingMinutes != null
  ) {
    const firstTransit = segments[0];
    const firstWalkTitle = `Gå till ${formatTransitStopName(firstTransit.from ?? data.route.boardingName, firstTransit.mode)}`;
    steps.push({
      kind: "walk",
      mode: "Walk",
      line: null,
      title: firstWalkTitle,
      subtitle: `Från ${originLabel}`,
      note: isTunnelbanaMode(firstTransit.mode)
        ? `${data.stationTiming.boardingMinutes} min till perrong`
        : null,
      connectorText: null,
      meta: null,
      duration: minutesLabel(data.stationTiming.boardingMinutes),
      departureTime: null,
      arrivalTime: null,
      stopCountLabel: null,
      restLabel: null,
    });
  }

  segments.forEach((segment, index) => {
    const nextSegment = index < segments.length - 1 ? segments[index + 1] : null;
    const previousSegment = index > 0 ? segments[index - 1] : null;

    if (segment.type === "WALK") {
      const walkTiming = buildWalkTimingNote({
        nextSegment,
        previousSegment,
        stationTiming: data.stationTiming,
        isFirst: index === 0,
        isLast: index === segments.length - 1,
      });

      steps.push({
        kind: "walk" as const,
        mode: segment.mode ?? "Walk",
        line: null,
        title: buildWalkTitle({
          segment,
          nextSegment,
          previousSegment,
          isFirst: index === 0,
          isLast: index === segments.length - 1,
          destinationLabel,
        }),
        subtitle: buildWalkSubtitle({
          segment,
          nextSegment,
          previousSegment,
          isFirst: index === 0,
          isLast: index === segments.length - 1,
          originLabel,
        }),
        note: walkTiming,
        connectorText: null,
        meta: null,
        duration: minutesLabel(segment.durationMinutes),
        departureTime: null,
        arrivalTime: null,
        stopCountLabel: null,
        restLabel: null,
      });
      return;
    }

    const line = segment.line ?? data.route?.line ?? null;
    const mode = getTransitLabel(segment.mode ?? data.route?.mode);
    const direction = segment.toward ?? data.route?.toward ?? "din destination";
    const from = segment.from ?? data.route?.boardingName ?? "påstigning";
    const to = segment.to ?? data.route?.destinationName ?? "avstigning";
    const platform = segment.platform ?? data.route?.platform ?? "—";
    const departureTime = segment.departureTime ?? data.route?.departureTime ?? null;
    const arrivalTime = segment.arrivalTime ?? data.route?.arrivalTime ?? null;
    const stopCount = getStopCountForSegment(data.stops, from, to);
    const connectorText = buildTransitConnectorText(to, segment.mode, nextSegment);

    steps.push({
      kind: "transit" as const,
      mode,
      line,
      title: `${mode} ${line ?? "—"} mot ${direction}`,
      subtitle: `${from} → ${to}${isPlatformRelevant(segment.mode ?? data.route?.mode) ? ` · Spår ${platform}` : ""}`,
      note: null,
      connectorText,
      meta: true,
      duration: minutesLabel(segment.durationMinutes),
      departureTime,
      arrivalTime,
      stopCountLabel: `${stopCount} stopp`,
      restLabel: `Restid ${minutesLabel(segment.durationMinutes)}`,
    });
  });

  return steps;
}

function buildWalkTitle({
  segment,
  nextSegment,
  previousSegment,
  isFirst,
  isLast,
  destinationLabel,
}: {
  segment: JourneySegment;
  nextSegment?: JourneySegment | null;
  previousSegment?: JourneySegment | null;
  isFirst: boolean;
  isLast: boolean;
  destinationLabel?: string;
}) {
  if (isFirst && nextSegment?.type === "TRANSIT") {
    return `Gå till ${formatTransitStopName(nextSegment.from ?? segment.to, nextSegment.mode)}`;
  }

  if (isLast && previousSegment?.type === "TRANSIT") {
    const from = segment.from ?? "stationen";
    const to = getPrimaryPlaceLabel(destinationLabel ?? segment.to, "destinationen");
    return `Gå från ${from} till ${to}`;
  }

  if (previousSegment?.type === "TRANSIT" && nextSegment?.type === "TRANSIT") {
    return "Byt och gå till nästa linje";
  }

  if (segment.from && segment.to) {
    return `Gå från ${segment.from} till ${segment.to}`;
  }

  if (segment.to) return `Gå till ${segment.to}`;
  if (segment.from) return `Gå från ${segment.from}`;
  return "Gå vidare";
}

function buildWalkSubtitle({
  segment,
  nextSegment,
  previousSegment,
  isFirst,
  isLast,
  originLabel,
}: {
  segment: JourneySegment;
  nextSegment?: JourneySegment | null;
  previousSegment?: JourneySegment | null;
  isFirst: boolean;
  isLast: boolean;
  originLabel?: string;
}) {
  if (isFirst && nextSegment?.type === "TRANSIT") {
    return originLabel ? `Från ${originLabel}` : segment.from ? `Från ${segment.from}` : "Från din plats";
  }

  if (isLast && previousSegment?.type === "TRANSIT") {
    return `Från ${formatTransitSourceLabel(segment.from, previousSegment.mode)}`;
  }

  if (previousSegment?.type === "TRANSIT" && nextSegment?.type === "TRANSIT") {
    const from = segment.from ?? "byte";
    const to = segment.to ?? "nästa linje";
    return `${from} → ${to}`;
  }

  if (segment.from) {
    return `Från ${segment.from}`;
  }

  return "Nästa steg i resan";
}

function buildTransitConnectorText(
  to?: string | null,
  currentMode?: string | null,
  nextSegment?: { type?: string | null; mode?: string | null; line?: string | null; toward?: string | null } | null,
) {
  if (nextSegment?.type === "TRANSIT") {
    const nextMode = getTransitLabel(nextSegment.mode);
    const nextLine = nextSegment.line ? ` ${nextSegment.line}` : "";
    return `Byt vid ${formatTransitSourceLabel(to, currentMode)} till ${nextMode}${nextLine}`;
  }

  if (nextSegment?.type === "WALK") {
    return `Gå av vid ${formatTransitSourceLabel(to, currentMode)}`;
  }

  return null;
}

function buildWalkTimingNote({
  nextSegment,
  previousSegment,
  stationTiming,
  isFirst,
  isLast,
}: {
  nextSegment?: JourneySegment | null;
  previousSegment?: JourneySegment | null;
  stationTiming?: JourneyTrip["stationTiming"];
  isFirst: boolean;
  isLast: boolean;
}) {
  if (isFirst && nextSegment?.type === "TRANSIT" && isTunnelbanaMode(nextSegment.mode)) {
    const minutes = stationTiming?.boardingMinutes;
    if (minutes != null) return `${minutes} min till perrong`;
    return null;
  }

  if (isFirst && nextSegment?.type === "TRANSIT" && isBusMode(nextSegment.mode)) {
    const minutes = stationTiming?.boardingMinutes;
    if (minutes != null) return `${minutes} min till hållplats`;
    return null;
  }

  if (isLast && previousSegment?.type === "TRANSIT" && isTunnelbanaMode(previousSegment.mode)) {
    const minutes = stationTiming?.arrivalMinutes;
    if (minutes != null) return `${minutes} min från perrong`;
    return "Från station";
  }

  if (previousSegment?.type === "TRANSIT" && nextSegment?.type === "TRANSIT") {
    const nextLine = nextSegment.line ? `${getTransitLabel(nextSegment.mode)} ${nextSegment.line}` : getTransitLabel(nextSegment.mode);
    return `Följ skyltar mot ${nextLine}`;
  }

  return null;
}

function isPlatformRelevant(mode?: string | null) {
  return isTunnelbanaMode(mode);
}

function isTunnelbanaMode(mode?: string | null) {
  const normalized = (mode ?? "").toLowerCase();
  return normalized.includes("metro") || normalized.includes("subway") || normalized.includes("tunnel");
}

function isBusMode(mode?: string | null) {
  const normalized = (mode ?? "").toLowerCase();
  return normalized.includes("bus");
}

function getTransitLabel(mode?: string | null) {
  const normalized = (mode ?? "").toLowerCase();
  if (isTunnelbanaMode(normalized)) return "Tunnelbana";
  if (normalized.includes("bus")) return "Buss";
  if (normalized.includes("train") || normalized.includes("rail")) return "Tåg";
  if (!mode) return "Tunnelbana";
  return mode;
}

function formatTransitStopName(name?: string | null, mode?: string | null) {
  const base = getPrimaryPlaceLabel(name, "stationen");
  const normalized = (mode ?? "").toLowerCase();

  if (isTunnelbanaMode(normalized)) {
    return `${base} T-bana`;
  }

  if (normalized.includes("bus")) {
    return `${base} busshållplats`;
  }

  if (normalized.includes("train") || normalized.includes("rail")) {
    return `${base} station`;
  }

  return base;
}

function formatTransitSourceLabel(name?: string | null, mode?: string | null) {
  const base = getPrimaryPlaceLabel(name, "stationen");
  const normalized = (mode ?? "").toLowerCase();

  if (isTunnelbanaMode(normalized) || normalized.includes("train") || normalized.includes("rail")) {
    return `${base} station`;
  }

  if (normalized.includes("bus")) {
    return `${base} busshållplats`;
  }

  return base;
}

function getPrimaryPlaceLabel(value?: string | null, fallback = "platsen") {
  if (!value || !value.trim()) return fallback;

  const [firstPart] = value.split(",");
  const trimmed = firstPart?.trim();
  return trimmed || value.trim();
}

function getStopCountForSegment(stops: JourneyStop[] | undefined, from?: string | null, to?: string | null) {
  const list = stops ?? [];
  if (!from || !to || list.length === 0) return Math.max(0, list.length - 1);

  const startIndex = list.findIndex((stop) => stop.name === from);
  if (startIndex === -1) return Math.max(0, list.length - 1);

  const endIndex = list.findIndex((stop, index) => index > startIndex && stop.name === to);
  if (endIndex === -1) return Math.max(0, list.length - 1);

  return Math.max(0, endIndex - startIndex);
}

function minutesLabel(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${minutes} min`;
}
