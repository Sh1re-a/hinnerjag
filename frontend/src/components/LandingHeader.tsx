import { LocateFixed } from "lucide-react";

type LandingHeaderProps = {
  addressLabel: string;
};

export function LandingHeader({ addressLabel }: LandingHeaderProps) {

  return (
    <>
      <nav className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
          HINNER JAG
        </p>

        <button
          className="cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/45"
          disabled
          type="button"
        >
          Byt plats
        </button>
      </nav>

      <header className="mt-2.5 flex items-center gap-2.5 sm:mt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300 backdrop-blur">
          <LocateFixed size={15} />
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="truncate text-[11px] text-white/56">{addressLabel}</p>
        </div>
      </header>
    </>
  );
}
