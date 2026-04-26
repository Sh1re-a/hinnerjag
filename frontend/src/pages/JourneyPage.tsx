import { useEffect, useState } from "react";
import { searchAddress } from "../hooks/useAddressSearch";
import { useCurrentPosition } from "../hooks/useCurrentPosition";
import { useJourneyPlan } from "../hooks/useJourneyPlan";
import type { JourneyPlanRequest } from "../hooks/useJourneyPlan";
import { JourneyResults } from "../components/JourneyResults";
import { JourneyDetail } from "../components/JourneyDetail";

type Address = { label: string; lat: number; lng: number };

export function JourneyPage({ onBack }: { onBack?: () => void }) {
  const { position, isLocating, requestPosition } = useCurrentPosition();

  const [origin, setOrigin] = useState<Address | null>(null);
  const [manualOriginMode, setManualOriginMode] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [originResults, setOriginResults] = useState<Address[]>([]);

  const [destination, setDestination] = useState<Address | null>(null);
  const [destQuery, setDestQuery] = useState("");
  const [destResults, setDestResults] = useState<Address[]>([]);

  const plan = useJourneyPlan();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  useEffect(() => {
    if (position && !origin && !manualOriginMode) {
      setOrigin({
        label: `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`,
        lat: position.lat,
        lng: position.lng,
      });
    }
  }, [position, origin, manualOriginMode]);

  const handleOriginSearch = async (q: string) => {
    setOriginQuery(q);
    if (q.length < 2) {
      setOriginResults([]);
      return;
    }

    try {
      const res = await searchAddress(q);
      setOriginResults(res);
    } catch {
      setOriginResults([]);
    }
  };

  const handleDestSearch = async (q: string) => {
    setDestQuery(q);
    if (q.length < 2) {
      setDestResults([]);
      return;
    }

    try {
      const res = await searchAddress(q);
      setDestResults(res);
    } catch {
      setDestResults([]);
    }
  };

  const handleUseMyPosition = async () => {
    try {
      const p = await requestPosition();
      setOrigin({ label: `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`, lat: p.lat, lng: p.lng });
      setManualOriginMode(false);
    } catch {
      // ignore: hook surfaces user error
    }
  };

  const handlePlan = () => {
    if (!origin || !destination) return;

    const req: JourneyPlanRequest = {
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    };

    plan.mutate(req);
  };

  return (
    <div className="mx-auto max-w-md p-4 text-white">
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm"
        >
          Tillbaka
        </button>
        <h2 className="text-lg font-semibold">Planera din resa</h2>
      </header>

      <section className="mb-4">
        <label className="block text-xs text-white/60 mb-1">Från</label>
        {manualOriginMode ? (
          <div>
            <input
              value={originQuery}
              onChange={(e) => void handleOriginSearch(e.target.value)}
              placeholder="Sök startadress…"
              className="input input-bordered w-full bg-white/5 text-white mb-2"
            />
            {originResults.length > 0 && (
              <ul className="menu bg-white/5 p-2 rounded-box mb-2">
                {originResults.map((r) => (
                  <li key={r.label}>
                    <button
                      className="text-left"
                      onClick={() => {
                        setOrigin(r);
                        setOriginResults([]);
                        setOriginQuery(r.label);
                        setManualOriginMode(false);
                      }}
                      type="button"
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="rounded bg-white/5 p-3">
                <div className="text-sm text-white/80">{origin?.label ?? "Ingen position vald"}</div>
                <div className="text-xs text-white/50">{position ? "Automatisk position" : "Välj manuellt"}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setManualOriginMode(true)}
                className="btn btn-ghost btn-sm"
              >
                Ändra
              </button>
              <button
                type="button"
                onClick={handleUseMyPosition}
                className="btn btn-primary btn-sm"
                disabled={isLocating}
              >
                Använd min position
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mb-4">
        <label className="block text-xs text-white/60 mb-1">Till</label>
        <input
          value={destQuery}
          onChange={(e) => void handleDestSearch(e.target.value)}
          placeholder="Sök destination…"
          className="input input-bordered w-full bg-white/5 text-white mb-2"
        />

        {destResults.length > 0 && (
          <ul className="menu bg-white/5 p-2 rounded-box mb-2">
            {destResults.map((r) => (
              <li key={r.label}>
                <button
                  className="text-left"
                  onClick={() => {
                    setDestination(r);
                    setDestResults([]);
                    setDestQuery(r.label);
                  }}
                  type="button"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mb-4 flex gap-2">
        <button
          onClick={handlePlan}
          disabled={!origin || !destination || plan.isPending}
          className="btn btn-primary flex-1"
          type="button"
        >
          {plan.isPending ? "Planerar…" : "Visa resor"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOrigin(null);
            setDestination(null);
            setOriginQuery("");
            setDestQuery("");
          }}
          className="btn btn-ghost"
        >
          Rensa
        </button>
      </div>

      {plan.isError && <div className="text-red-400">{(plan.error as Error)?.message ?? "Fel vid planering"}</div>}

      {plan.data && (
        <div>
          <section className="rounded-lg bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50">Rekommenderad avgång</div>
                <div className="text-lg font-semibold">{plan.data.recommendedLeaveAt ?? "—"}</div>
                <div className="text-sm text-white/60">{plan.data.recommendedLeaveInMinutes} minuter</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/50">Beräknad tid</div>
                <div className="text-lg font-semibold">{plan.data.plannedDurationMinutes ?? "—"} min</div>
              </div>
            </div>
          </section>

          <div className="mt-3">
            <JourneyResults data={plan.data} onSelectSegment={(i) => setSelectedSegment(i)} />
            {selectedSegment !== null && (
              <div className="mt-2">
                <JourneyDetail data={plan.data} segmentIndex={selectedSegment} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JourneyPage;
