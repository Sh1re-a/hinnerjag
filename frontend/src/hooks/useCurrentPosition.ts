import { useCallback, useState } from "react";

export type PositionState = {
  lat: number;
  lng: number;
};

export function useCurrentPosition() {
  const [position, setPosition] = useState<PositionState | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation stöds inte i din webbläsare.");
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      const nextPosition = await new Promise<PositionState>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (coords) => {
            resolve({
              lat: coords.coords.latitude,
              lng: coords.coords.longitude,
            });
          },
          () => reject(new Error("Kunde inte hämta din position.")),
          { enableHighAccuracy: true },
        );
      });

      setPosition(nextPosition);
      return nextPosition;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kunde inte hämta position.";
      setLocationError(message);
      throw error;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return {
    position,
    isLocating,
    locationError,
    requestPosition,
  };
}