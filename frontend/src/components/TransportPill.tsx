import { getLineTone } from "./boardUi";

type Props = {
  line?: string | null;
  mode?: string | null;
  size?: "sm" | "md" | "lg";
};

export default function TransportPill({ line, mode, size = "md" }: Props) {
  const tone = getLineTone(({ transportMode: mode ?? undefined, line: line ?? undefined } as unknown) as any);
  const sizeClasses = size === "sm" ? "h-6 min-w-[24px] text-[11px] px-2" : "h-7 min-w-[28px] text-[12px] px-2.5";

  return (
    <div className={`flex items-center justify-center rounded-md font-semibold ${tone} ${sizeClasses}`}>
      {line ?? (mode ? mode.charAt(0).toUpperCase() : "W")}
    </div>
  );
}
