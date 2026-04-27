import { BusFront, TrainFront } from "lucide-react";
import { OuterCard } from "./CardBase";
import { sectionLabel, smallText } from "./uiTokens";

type DecisionCardProps = {
  platformMinutes: number | null;
  platformWalkMinutes: number | null;
  platformBufferMinutes: number | null;
  busWalkMinutes: number | null;
};

export function DecisionCard({
  platformMinutes,
  platformWalkMinutes,
  platformBufferMinutes,
  busWalkMinutes,
}: DecisionCardProps) {
  const platformText =
    platformMinutes === null ? "--" : `${platformMinutes} min`;
  const busText = busWalkMinutes === null ? "--" : `${busWalkMinutes} min`;

  const platformAccessTip =
    platformWalkMinutes === null || platformBufferMinutes === null
      ? "gång + spärr/trappa"
      : `${platformWalkMinutes} min gång + ${platformBufferMinutes} min spärr/trappa`;

  return (
    <OuterCard>
      <div className={sectionLabel}>Från din plats</div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="h-full rounded-md border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="inline-flex items-center gap-1.5 text-sky-300">
            <TrainFront size={14} />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Perrong</span>
          </div>
          <p className="mt-2 text-[18px] font-semibold leading-none text-emerald-300">
            {platformText}
          </p>

          <p
            className="mt-2 text-[10px] leading-snug text-white/68"
            title={platformAccessTip}
          >
            {platformAccessTip}
          </p>
        </div>

        <div className="h-full rounded-md border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="inline-flex items-center gap-1.5 text-sky-300">
            <BusFront size={14} />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Buss</span>
          </div>
          <p className="mt-2 text-[18px] font-semibold leading-none text-emerald-300">
            {busText}
          </p>
          <p className="mt-2 text-[10px] leading-snug text-white/68">
            Gångavstånd till hållplats
          </p>
        </div>
      </div>

      <p className={`mt-2 ${smallText}`}>
        Beräknat från där du står till perrong eller hållplats.
      </p>
    </OuterCard>
  );
}
