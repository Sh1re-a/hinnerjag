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
    <div className="fixed inset-x-4 z-20 mx-auto max-w-3xl sm:inset-x-6" style={{ bottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}>
      <button
        className={`${ctaClass} transition hover:bg-emerald-400 sm:text-lg`}
        onClick={onClick}
        type="button"
      >
        <span className="flex items-center gap-3">
          <ArrowRight className={iconSize} />
          {label}
        </span>
        <ArrowRight className={iconSize} />
      </button>
    </div>
  );
}
