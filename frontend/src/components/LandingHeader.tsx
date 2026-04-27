import { sectionLabel } from "./uiTokens";

type LandingHeaderProps = {
  addressLabel?: string;
  title?: string;
  subtitle?: string;
  onSelectAddress?: (lat: number, lng: number, label: string) => void;
};

export function LandingHeader(_: LandingHeaderProps) {
  return (
    <div className="px-1 pt-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-1">
          <p className={sectionLabel}>HINNER JAG</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-1 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live
        </div>
      </div>
    </div>
  );
}
