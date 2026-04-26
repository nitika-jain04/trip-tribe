import TripsClient from "./TripsClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "Explore Community Trips - TripTribe",
  description:
    "Discover and compare group trips from verified community providers across India. Search by destination, type, and difficulty.",
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

export default async function Page({ searchParams }) {
  const {
    search = "",
    page = "1",
    location_name = "",
    location_type = "",
    group_by = "",
  } = await searchParams;

  const params = new URLSearchParams();
  // Align logic with Client: Only search if 2+ chars
  if (search && search.trim().length >= 2) {
    params.set("search", search.trim());
  }

  if (location_name) params.set("location_name", location_name);
  if (location_type) params.set("location_type", location_type);
  if (group_by) params.set("group_by", group_by);

  params.set("page", page);
  params.set("limit", "10");

  const [initialTrips, locationMap, tripTypesRaw, operatorsRaw] = await Promise.all([
    fetchData(
      `${BASE_URL}/api/${API_VERSION}/trips?sortBy=updated_at&order=DESC&${params.toString()}`,
    ),
    getLocationMap(),
    fetchData(`${BASE_URL}/api/${API_VERSION}/trip-types`),
    fetchData(`${BASE_URL}/api/${API_VERSION}/operators`),
  ]);

  const tripTypesData = [
    { id: "all", name: "All Types" },
    ...(tripTypesRaw?.result?.trip_types?.map((t) => ({
      id: t.id,
      name: t.name,
    })) || []),
  ];

  const operatorsData = operatorsRaw?.result?.operators
    ?.filter((op) => op.total_trips >= 1)
    ?.map((op) => ({
      id: op.id,
      name: op.name,
    })) || [];

  return (
    <TripsClient
      initialTrips={initialTrips}
      locationMap={locationMap}
      tripTypesData={tripTypesData}
      operatorsData={operatorsData}
    />
  );
}
