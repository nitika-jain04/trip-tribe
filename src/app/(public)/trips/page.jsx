import TripsClient from "./TripsClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "Explore Community Trips | TripTribe",
  description:
    "Discover and compare group trips from verified community providers across India. Search by destination, type, and difficulty.",
};

async function fetchData(url, revalidate = 60) {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getLocationMap() {
  const data = await fetchData(`${BASE_URL}/api/${API_VERSION}/locations`, 3600);
  const map = {};
  if (data?.success && data?.result?.locations) {
    data.result.locations.forEach((loc) => {
      map[loc.id] = { name: loc.name, region: loc.region };
    });
  }
  return map;
}

export default async function Page({ searchParams }) {
  const { search = "", page = "1" } = await searchParams;

  const params = new URLSearchParams();
  // Align logic with Client: Only search if 2+ chars
  if (search && search.trim().length >= 2) {
    params.set("search", search.trim());
  }
  params.set("page", page);
  params.set("limit", "10");

  const [initialTrips, locationMap, tripTypesRaw] = await Promise.all([
    fetchData(
      `${BASE_URL}/api/${API_VERSION}/trips?sortBy=updated_at&order=DESC&${params.toString()}`,
    ),
    getLocationMap(),
    fetchData(`${BASE_URL}/api/${API_VERSION}/trip-types`, 3600),
  ]);

  const tripTypesData = ["All Types", ...(tripTypesRaw?.result?.trip_types?.map((t) => t.name) || [])];

  return (
    <TripsClient
      initialTrips={initialTrips}
      locationMap={locationMap}
      tripTypesData={tripTypesData}
    />
  );
}
