import { sectionLabel } from "./uiTokens";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <p className={`${sectionLabel} tracking-[0.18em] text-white/66 ${className}`.trim()}>
      <span className="font-medium">Hinner</span>
      <span className="font-semibold italic text-white/86">Jag</span>
    </p>
  );
}

export default BrandWordmark;
