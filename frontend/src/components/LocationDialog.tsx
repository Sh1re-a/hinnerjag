import { LocateFixed, ShieldCheck } from "lucide-react";
import BrandWordmark from "./BrandWordmark";
import { ctaClass, subtleButton } from "./uiTokens";

type LocationDialogProps = {
  open: boolean;
  isLocating: boolean;
  locationError: string | null;
  onAllow: () => void;
  onSkip?: () => void;
};

export function LocationDialog({
  open,
  isLocating,
  locationError,
  onAllow,
  onSkip,
}: LocationDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[420px] rounded-[22px] border border-white/10 bg-[#121821]/95 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <BrandWordmark />
            <h2 className="mt-2 text-[26px] font-semibold leading-tight">
              Se om du hinner nära dig
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300">
            <LocateFixed size={20} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/68">
          Tillåt din plats för att visa tunnelbana, buss och restider direkt när appen öppnas.
        </p>

        <button
          onClick={onAllow}
          disabled={isLocating}
          className={`${ctaClass} mt-5 h-12 w-full rounded-[18px]`}
          type="button"
        >
          {isLocating ? "Hämtar plats..." : "Tillåt plats"}
        </button>

        <button
          onClick={onSkip}
          className={`${subtleButton} mt-2 h-11 w-full border-transparent bg-transparent text-white/72 hover:bg-white/[0.04]`}
          type="button"
        >
          Fortsätt utan
        </button>

        {locationError && (
          <p className="mt-3 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {locationError}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-white/45">
          <ShieldCheck size={14} />
          Din plats används bara för att visa avgångar nära dig.
        </div>
      </div>
    </div>
  );
}
