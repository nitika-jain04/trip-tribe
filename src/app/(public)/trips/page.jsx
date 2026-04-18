import TripsClient from "./TripsClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "Explore Community Trips | TripTribe",
  description:
    "Discover and compare group trips from verified community providers across India. Search by destination, type, and difficulty.",
};

async function fetchData(url, revalidate = 0) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

async function getLocationMap() {
  const res = await fetch(`${BASE_URL}/api/${API_VERSION}/locations`, {
    cache: "no-store",
  });
  const data = await res.json();
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

  const tripTypesData = [
    { id: "all", name: "All Types" },
    ...(tripTypesRaw?.result?.trip_types?.map((t) => ({
      id: t.id,
      name: t.name,
    })) || []),
  ];

  // if (initialTrips) {
  //   console.log("[Server] Trips Page API Response:", {
  //     success: initialTrips.success,
  //     total: initialTrips.result?.pagination?.total,
  //     count: initialTrips.result?.trips?.length,
  //   });
  // }

  return (
    <TripsClient
      initialTrips={initialTrips}
      locationMap={locationMap}
      tripTypesData={tripTypesData}
    />
  );
}
