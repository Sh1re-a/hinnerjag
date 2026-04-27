import { useState } from "react";
import type { TripSummaryResponse } from "../hooks/useJourneyPlan";
import { OuterCard } from "./CardBase";
import TransportPill from "./TransportPill";
import { sectionLabel, sectionTitle, smallText, subtleButton } from "./uiTokens";
import { getJourneyFacts, getTimeline } from "../lib/journeyUi";

type Props = {
  data: TripSummaryResponse;
  segmentIndex: number;
  originLabel?: string;
  destinationLabel?: string;
};

export function JourneyDetail({ data, segmentIndex, originLabel, destinationLabel }: Props) {
  const [showFacts, setShowFacts] = useState(false);
  const timeline = getTimeline(data, originLabel, destinationLabel);
  const facts = getJourneyFacts(data);
  const topFacts = facts.slice(0, 4);
  const bottomFacts = facts.slice(4);

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className={sectionLabel}>Detaljerad resväg</div>
        <h3 className={`mt-2 ${sectionTitle}`}>
          {(originLabel && destinationLabel)
            ? `${originLabel} → ${destinationLabel}`
            : "Steg för steg"}
        </h3>
      </div>

      <OuterCard>
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold text-cyan-100">Tidslinje</div>
          <div className="text-[11px] text-white/50">{segmentIndex === 0 ? "Vald resa" : `Del ${segmentIndex + 1}`}</div>
        </div>

        <div className="space-y-4">
          {timeline.items.map((item, index) => (
            <div key={`${item.time}-${item.label}-${index}`} className="flex items-start gap-2.5">
              <div className="w-9 shrink-0 pt-1 text-[12px] font-medium text-white/78">
                {item.time}
              </div>

              <div className="flex min-h-12 w-4 shrink-0 flex-col items-center">
                <div
                  className={`mt-1 h-3 w-3 rounded-full border-2 ${
                    item.kind === "walk"
                      ? "border-emerald-400 bg-emerald-400/10"
                      : item.kind === "arrival"
                        ? "border-emerald-400 bg-[#081b15]"
                        : "border-sky-400 bg-[#0d1f35]"
                  }`}
                />
                {index < timeline.items.length - 1 && <div className="mt-2 w-px flex-1 bg-white/10" />}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-[14px] font-semibold text-white">{item.label}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-white/58">{item.detail}</div>

                {index === 1 && timeline.transitLine && (
                  <div className="mt-2.5 overflow-hidden rounded-md bg-white/[0.03]">
                    <div className="flex items-start justify-between gap-3 px-3 py-2.5">
                      <div className="flex items-start gap-3">
                        <TransportPill line={timeline.transitLine} mode={data.route?.mode} size="sm" />
                        <div>
                          <div className="text-[13px] font-semibold text-white">
                            Mot {timeline.transitDirection ?? "din destination"}
                          </div>
                          <div className="mt-0.5 text-[11px] text-white/55">
                            {[timeline.transitDurationLabel, `${timeline.transitStopCount} stopp`].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-medium text-white/72">
                        {timeline.transitWindow ?? "—"}
                      </div>
                    </div>

                    <div className="border-t border-white/6 px-3 py-2">
                      <div className="space-y-1.5">
                        {timeline.transitStops.slice(0, 6).map((stop, stopIndex) => (
                          <div
                            key={`${stop.name}-${stopIndex}`}
                            className="grid grid-cols-[36px_minmax(0,1fr)_22px] items-center gap-2 rounded-md bg-black/10 px-2.5 py-1.5"
                          >
                            <div className="font-mono text-[12px] text-white/66">
                              {stop.departureTime ?? stop.arrivalTime ?? "—"}
                            </div>
                            <div className="truncate text-[12px] text-white/84">{stop.name}</div>
                            <div className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.03] text-[10px] text-white/55">
                              {stop.platform ?? "—"}
                            </div>
                          </div>
                        ))}
                        {timeline.transitStops.length > 6 && (
                          <div className="pt-1 text-[12px] text-white/45">
                            +{timeline.transitStops.length - 6} fler stopp i detalj
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">
          <div className={smallText}>Total gångtid: {timeline.walkingLabel}</div>
          <div className={smallText}>Total restid: {timeline.totalLabel}</div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={() => setShowFacts((current) => !current)} className={subtleButton}>
            {showFacts ? "Dölj info" : "Mer info"}
          </button>
        </div>
      </OuterCard>

      {showFacts && (
        <OuterCard>
          <div className="mb-3">
            <div className={sectionLabel}>Tid & detaljer</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...topFacts, ...bottomFacts].map((fact) => (
              <div
                key={fact.label}
                className="rounded-md bg-white/[0.03] px-3 py-2"
              >
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">{fact.label}</div>
                <div className="mt-1 text-[14px] font-medium text-white">{fact.value}</div>
              </div>
            ))}
          </div>
        </OuterCard>
      )}
    </div>
  );
}

export default JourneyDetail;
