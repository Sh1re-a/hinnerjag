type BottomJourneyCtaProps = {
  onClick?: () => void;
};

export function BottomJourneyCta({ onClick }: BottomJourneyCtaProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-3xl sm:inset-x-6">
      <button
        className="flex w-full items-center justify-between rounded-3xl bg-emerald-500 px-5 py-4 text-left text-base font-semibold text-white shadow-[0_16px_36px_rgba(34,197,94,0.30)] transition hover:bg-emerald-400 sm:text-lg"
        onClick={onClick}
        type="button"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">➜</span>
          Hinner du med din resa?
        </span>
        <span className="text-xl">→</span>
      </button>
    </div>
  );
}
