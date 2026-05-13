import { fetchOperators } from "@/app/utils/operators";
import HomeClient from "./HomeClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "TripTribe",
  description:
    "Discover curated group trips, adventures, and travel communities across India. Compare itineraries, prices, and verified partners directly on TripTribe.",
  keywords: [
    "group trips",
    "community travel",
    "adventure trips India",
    "solo travel groups",
    "verified travel operators",
    "trip aggregator",
  ],
};

async function fetchData(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return null;
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    // Silently handle network/fetch failures to prevent console noise
    return null;
  }
}

async function getLocationMap() {
  const data = await fetchData(`${BASE_URL}/api/${API_VERSION}/locations`);
  const map = {};
  if (data?.success && data?.result?.locations) {
    data.result.locations.forEach((loc) => {
      map[loc.id] = { name: loc.name, region: loc.region };
    });
  }
  return map;
}

export default async function Page() {
  // Fetch all data concurrently on the server
  const [initialLocations, initialOperators, initialTrips, locationMap] =
    await Promise.all([
      fetchData(
        `${BASE_URL}/api/${API_VERSION}/trips?group_by=location&sortBy=updated_at&order=DESC`,
      ),
      fetchOperators({ page: 1, limit: 9 }),
      fetchData(
        `${BASE_URL}/api/${API_VERSION}/trips?sortBy=created_at&order=DESC`,
      ),
      getLocationMap(),
    ]);

  const totalTrips = initialTrips?.result?.pagination?.total;
  const totalOperators = initialOperators?.result?.pagination?.total;

  return (
    <HomeClient
      initialLocations={initialLocations}
      initialOperators={initialOperators}
      initialTrips={initialTrips}
      locationMap={locationMap}
      totalTrips={totalTrips}
      totalOperators={totalOperators}
    />
  );
}
