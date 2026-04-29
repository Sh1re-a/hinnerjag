import { Home, Info, Route, UserRound } from "lucide-react";

type BottomNavProps = {
  currentView: "landing" | "journey" | "about";
  onChange: (view: "landing" | "journey" | "about") => void;
};

const itemBase =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-medium transition";

export function BottomNav({ currentView, onChange }: BottomNavProps) {
  return (
    <div
      className="fixed inset-x-3 z-20 mx-auto max-w-[414px] sm:inset-x-6 sm:max-w-3xl"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 14px) + 8px)" }}
    >
      <nav className="flex items-center gap-1 rounded-[20px] border border-white/8 bg-[#131a24]/92 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onChange("landing")}
          className={`${itemBase} ${
            currentView === "landing"
              ? "bg-emerald-500/12 text-emerald-300"
              : "text-white/52 hover:bg-white/[0.04] hover:text-white/74"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Hem</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("journey")}
          className={`${itemBase} ${
            currentView === "journey"
              ? "bg-emerald-500/12 text-emerald-300"
              : "text-white/52 hover:bg-white/[0.04] hover:text-white/74"
          }`}
        >
          <Route className="h-4 w-4" />
          <span>Resor</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("about")}
          className={`${itemBase} ${
            currentView === "about"
              ? "bg-emerald-500/12 text-emerald-300"
              : "text-white/52 hover:bg-white/[0.04] hover:text-white/74"
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Om</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`${itemBase} cursor-not-allowed text-white/28`}
        >
          <UserRound className="h-4 w-4" />
          <span>Konto</span>
        </button>
      </nav>
    </div>
  );
}

export default BottomNav;
