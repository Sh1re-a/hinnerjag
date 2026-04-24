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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-6 text-white shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-3xl text-blue-300">
          📍
        </div>

        <h2 className="mt-5 text-center text-3xl font-semibold">
          Tillåt din position?
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-white/70">
          Vi använder din position för att visa närmaste tåg och bussar direkt
          när appen öppnas.
        </p>

        <button
          onClick={onAllow}
          disabled={isLocating}
          className="btn btn-primary mt-6 h-14 w-full rounded-2xl text-base"
          type="button"
        >
          {isLocating ? "Hämtar position..." : "Tillåt"}
        </button>

        <button
          onClick={onSkip}
          className="btn btn-ghost mt-3 h-14 w-full rounded-2xl text-base text-white/80"
          type="button"
        >
          Inte nu
        </button>

        {locationError && (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {locationError}
          </p>
        )}

        <p className="mt-5 text-center text-xs text-white/45">
          Din position används endast för att visa närmaste avgångar.
        </p>
      </div>
    </div>
  );
}
