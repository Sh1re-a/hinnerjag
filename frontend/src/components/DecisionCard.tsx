import { BusFront, TrainFront } from "lucide-react";

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
    <section className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#171c22]/95 p-2.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <p className="text-[12px] font-medium text-white/85">Från din plats</p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="h-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
          <div className="inline-flex items-center gap-1.5 text-sky-300">
            <TrainFront size={14} />
            <span className="text-[11px] font-medium">Perrong</span>
          </div>
          <p className="mt-1 text-[22px] font-semibold leading-none text-emerald-300">
            {platformText}
          </p>

          <p
            className="mt-2 truncate whitespace-nowrap text-[10px] text-white/78"
            title={platformAccessTip}
          >
            {platformAccessTip}
          </p>
        </div>

        <div className="h-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
          <div className="inline-flex items-center gap-1.5 text-sky-300">
            <BusFront size={14} />
            <span className="text-[11px] font-medium">Buss</span>
          </div>
          <p className="mt-1 text-[22px] font-semibold leading-none text-emerald-300">
            {busText}
          </p>
          <p className="mt-2 truncate whitespace-nowrap text-[10px] text-white/75">
            Gångavstånd till hållplats
          </p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-white/68">
        Beräknat från där du står till perrong eller hållplats.
      </p>
    </section>
  );
}
