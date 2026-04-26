import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export type JourneyPlace = {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  type: string;
};

type JourneyRouteSummary = {
  departureTime: string | null;
  arrivalTime: string | null;
  mode: string | null;
  line: string | null;
  toward: string | null;
  boardingName: string | null;
  destinationName: string | null;
};

export type JourneySummary = {
  realisticDurationMinutes: number | null;
  recommendedLeaveInMinutes: number | null;
  transfers: number | null;
  route: JourneyRouteSummary | null;
};

export type JourneySearchSelection = {
  origin: JourneyPlace;
  destination: JourneyPlace;
  summary: JourneySummary | null;
};

type JourneySearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: JourneySearchSelection) => void;
  currentLocation?: JourneyPlace | null;
};

type StopFinderLocation = {
  id: string;
  name: string;
  type: string;
  coord?: [number, number];
};

type StopFinderResponse = {
  locations?: StopFinderLocation[];
};

type TripSummaryResponse = {
  realisticDurationMinutes: number | null;
  recommendedLeaveInMinutes: number | null;
  transfers: number | null;
  route: JourneyRouteSummary | null;
};

type SearchField = "origin" | "destination";

const STOP_FINDER_URL =
  "https://journeyplanner.integration.sl.se/v2/stop-finder";
const MIN_SEARCH_LENGTH = 2;
const RESULT_LIMIT = 6;
const SEARCH_DELAY_MS = 300;

export function JourneySearchDialog({
  open,
  onClose,
  onSelect,
  currentLocation,
}: JourneySearchDialogProps) {
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<JourneyPlace | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<JourneyPlace | null>(null);
  const [activeField, setActiveField] = useState<SearchField>("destination");
  const [results, setResults] = useState<JourneyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<JourneySummary | null>(null);

  useEffect(() => {
    if (!open) {
      setOriginQuery("");
      setDestinationQuery("");
      setSelectedOrigin(null);
      setSelectedDestination(null);
      setActiveField("destination");
      setResults([]);
      setIsLoading(false);
      setIsPlanning(false);
      setErrorMessage(null);
      setSummary(null);
      return;
    }

    if (currentLocation) {
      setSelectedOrigin(currentLocation);
      setOriginQuery(currentLocation.name);
    }
  }, [currentLocation, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = activeField === "origin" ? originQuery : destinationQuery;
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `${STOP_FINDER_URL}?name_sf=${encodeURIComponent(trimmedQuery)}&type_sf=any&any_obj_filter_sf=46`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Kunde inte söka plats just nu.");
        }

        const data = (await response.json()) as StopFinderResponse;

        const nextResults = (data.locations ?? [])
          .slice(0, RESULT_LIMIT)
          .map((location) => ({
            id: location.id,
            name: location.name,
            type: location.type,
            lat: location.coord?.[0] ?? null,
            lng: location.coord?.[1] ?? null,
          }));

        setResults(nextResults);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setResults([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Något gick fel när vi sökte.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [activeField, destinationQuery, open, originQuery]);

  const applyPlace = (field: SearchField, place: JourneyPlace) => {
    setErrorMessage(null);

    if (field === "origin") {
      setSelectedOrigin(place);
      setOriginQuery(place.name);
      setActiveField("destination");
    } else {
      setSelectedDestination(place);
      setDestinationQuery(place.name);
    }

    setResults([]);
  };

  const handleFieldChange = (field: SearchField, value: string) => {
    setSummary(null);
    setErrorMessage(null);
    setActiveField(field);

    if (field === "origin") {
      setOriginQuery(value);

      if (selectedOrigin?.name !== value) {
        setSelectedOrigin(null);
      }

      return;
    }

    setDestinationQuery(value);

    if (selectedDestination?.name !== value) {
      setSelectedDestination(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!currentLocation) {
      return;
    }

    applyPlace("origin", currentLocation);
  };

  const handlePlanJourney = async () => {
    if (!selectedOrigin || !selectedDestination) {
      setErrorMessage("Välj både från och till innan du söker resa.");
      return;
    }

    if (
      selectedOrigin.lat === null ||
      selectedOrigin.lng === null ||
      selectedDestination.lat === null ||
      selectedDestination.lng === null
    ) {
      setErrorMessage("Vald plats saknar koordinater. Välj en annan träff.");
      return;
    }

    setIsPlanning(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch<TripSummaryResponse>("/api/plans/journey", {
        method: "POST",
        body: JSON.stringify({
          originLat: selectedOrigin.lat,
          originLng: selectedOrigin.lng,
          destinationLat: selectedDestination.lat,
          destinationLng: selectedDestination.lng,
        }),
      });

      const nextSummary: JourneySummary = {
        realisticDurationMinutes: response.realisticDurationMinutes,
        recommendedLeaveInMinutes: response.recommendedLeaveInMinutes,
        transfers: response.transfers,
        route: response.route,
      };

      setSummary(nextSummary);
      onSelect({
        origin: selectedOrigin,
        destination: selectedDestination,
        summary: nextSummary,
      });
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Kunde inte planera resa just nu.",
      );
    } finally {
      setIsPlanning(false);
    }
  };

  const canPlan = Boolean(selectedOrigin && selectedDestination && !isPlanning);

  if (!open) {
    return null;
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg bg-[#151c27] text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Vart ska du?</h3>
            <p className="mt-1 text-sm text-white/65">
              Testa resa från valfri adress, station eller plats i Stockholm.
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            type="button"
          >
            Stäng
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white/70">
              <span>Från</span>
              {currentLocation && (
                <button
                  className="text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                  onClick={handleUseCurrentLocation}
                  type="button"
                >
                  Använd min plats
                </button>
              )}
            </div>
            <input
              className="input input-bordered w-full bg-white/5 text-white placeholder:text-white/35"
              onChange={(event) => handleFieldChange("origin", event.target.value)}
              onFocus={() => setActiveField("origin")}
              placeholder="Sök t.ex. Telefonplan eller Hornsgatan 12"
              type="text"
              value={originQuery}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Till</span>
            <input
              autoFocus
              className="input input-bordered w-full bg-white/5 text-white placeholder:text-white/35"
              onChange={(event) => handleFieldChange("destination", event.target.value)}
              onFocus={() => setActiveField("destination")}
              placeholder="Sök t.ex. Slussen eller Odenplan"
              type="text"
              value={destinationQuery}
            />
          </label>
        </div>

        {((activeField === "origin" ? originQuery : destinationQuery).trim().length > 0) &&
          ((activeField === "origin" ? originQuery : destinationQuery).trim().length < MIN_SEARCH_LENGTH) && (
            <p className="mt-3 text-sm text-white/55">Skriv minst 2 tecken.</p>
          )}

        {isLoading && (
          <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
            <span className="loading loading-spinner loading-sm" />
            Söker plats...
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-error mt-4">
            <span>{errorMessage}</span>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          (activeField === "origin" ? originQuery : destinationQuery).trim().length >= MIN_SEARCH_LENGTH &&
          results.length === 0 && (
            <p className="mt-4 text-sm text-white/60">Inga träffar hittades.</p>
          )}

        {results.length > 0 && (
          <ul className="menu mt-4 rounded-box border border-white/10 bg-white/5 p-2">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  className="flex items-start justify-between gap-3 text-left"
                  onClick={() => applyPlace(activeField, result)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-white">
                      {result.name}
                    </span>
                    <span className="block text-xs uppercase tracking-wide text-white/45">
                      {result.type}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {(selectedOrigin || selectedDestination) && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
            <p>
              Från: <span className="font-medium text-white">{selectedOrigin?.name ?? "Välj plats"}</span>
            </p>
            <p className="mt-1">
              Till: <span className="font-medium text-white">{selectedDestination?.name ?? "Välj plats"}</span>
            </p>
          </div>
        )}

        {summary && (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <p className="font-medium text-white">
              Ca {summary.realisticDurationMinutes ?? "-"} min • {summary.transfers ?? 0} byten
            </p>
            <p className="mt-1 text-emerald-100/85">
              {summary.recommendedLeaveInMinutes === null
                ? "Resan finns klar att prova."
                : `Lämna om ${summary.recommendedLeaveInMinutes} min.`}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            className="btn btn-success rounded-full px-5 text-white disabled:border-white/10 disabled:bg-white/10 disabled:text-white/45"
            disabled={!canPlan}
            onClick={() => {
              void handlePlanJourney();
            }}
            type="button"
          >
            {isPlanning ? "Söker resa..." : "Visa resa"}
          </button>
        </div>
      </div>

      <form className="modal-backdrop" method="dialog">
        <button onClick={onClose} type="button">
          close
        </button>
      </form>
    </dialog>
  );
}
