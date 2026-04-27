import { ArrowRight } from "lucide-react";
type BottomJourneyCtaProps = {
  onClick?: () => void;
  label?: string;
};

import { ctaClass, iconSize } from "./uiTokens";

export function BottomJourneyCta({
  onClick,
  label = "Hinner du med din resa?",
}: BottomJourneyCtaProps) {
  return (
    <div className="fixed inset-x-3 z-20 mx-auto max-w-[414px] sm:inset-x-6 sm:max-w-3xl" style={{ bottom: 'calc(env(safe-area-inset-bottom, 14px) + 8px)' }}>
      <button
        className={`${ctaClass} transition hover:bg-emerald-400`}
        onClick={onClick}
        type="button"
      >
        <span className="flex items-center gap-1.5">
          <ArrowRight className={iconSize} />
          {label}
        </span>
        <ArrowRight className={iconSize} />
      </button>
    </div>
  );
}
