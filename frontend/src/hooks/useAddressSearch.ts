type MapboxFeature = {
  place_name: string;
  center: [number, number];
};

type MapboxResponse = {
  features: MapboxFeature[];
};

const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_KEY;

export async function searchAddress(
  query: string,
): Promise<{ label: string; lat: number; lng: number }[]> {
  if (!MAPBOX_KEY) {
    throw new Error("Missing VITE_MAPBOX_KEY");
  }

  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_KEY}&autocomplete=true&country=SE&limit=5`,
  );
  const data: MapboxResponse = await resp.json();
  return data.features.map((f) => ({
    label: f.place_name,
    lat: f.center[1],
    lng: f.center[0],
  }));
}
