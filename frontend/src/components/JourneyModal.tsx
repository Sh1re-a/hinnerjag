import { useEffect, useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { useJourneyPlan } from "../hooks/useJourneyPlan";

type Address = { label: string; lat: number; lng: number };

type Props = {
  open: boolean;
  onClose: () => void;
  origin: { lat: number; lng: number; label?: string } | null;
};

export function JourneyModal({ open, onClose, origin }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | null>(null);

  const plan = useJourneyPlan();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected(null);
      plan.reset();
    }
  }, [open, plan]);

  const handleSearch = async (v: string) => {
    setQuery(v);
    if (v.length < 2) {
      setResults([]);
      return;
    }

    try {
      const r = await searchAddress(v);
      setResults(r);
    } catch {
      setResults([]);
    }
  };

  const handlePlan = () => {
    if (!origin || !selected) return;
    plan.mutate({
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: selected.lat,
      destinationLng: selected.lng,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#071018] p-4 text-white">
        <header className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Planera resa</h3>
          <button onClick={onClose} className="text-sm text-white/60">Stäng</button>
        </header>

        <div className="text-xs text-white/60 mb-2">Start: {origin?.label ?? "Din position"}</div>

        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Sök destination…"
          className="input input-bordered bg-white/5 text-white w-full mb-2"
        />

        {results.length > 0 && (
          <ul className="menu bg-white/5 p-2 rounded-box mb-2">
            {results.map((r) => (
              <li key={r.label}>
                <button
                  className="text-left"
                  onClick={() => {
                    setSelected(r);
                    setResults([]);
                    setQuery(r.label);
                  }}
                  type="button"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button
            onClick={handlePlan}
            disabled={!origin || !selected || plan.isLoading}
            className="btn btn-primary flex-1"
          >
            {plan.isLoading ? "Planerar…" : "Planera resa"}
          </button>
          <button onClick={onClose} className="btn btn-ghost">Avbryt</button>
        </div>

        {plan.isError && <div className="text-red-400 mt-2">{(plan.error as Error)?.message ?? "Fel"}</div>}

        {plan.data && (
          <div className="mt-3 bg-white/5 p-3 rounded">
            <div className="text-sm font-semibold">Lämna kl {plan.data.recommendedLeaveAt}</div>
            <div className="text-xs text-white/60">Eller om {plan.data.recommendedLeaveInMinutes} minuter</div>
            <div className="mt-2 text-xs">
              <div><strong>Resa:</strong> {plan.data.route?.mode} {plan.data.route?.line} → {plan.data.route?.toward}</div>
              <div><strong>Beräknad tid:</strong> {plan.data.plannedDurationMinutes} min</div>
              <div><strong>Gång:</strong> {plan.data.walkingDurationMinutes} min</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
