// import TripDetailClient from "./TripDetailClient";
// import { notFound } from "next/navigation";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// // Helper to map trip data (Server Side)
// const mapServerTripData = (tripDataRaw) => {
//   if (!tripDataRaw?.success) return null;

//   const raw = Array.isArray(tripDataRaw.result?.trips)
//     ? tripDataRaw.result.trips[0]
//     : tripDataRaw.result;
//   if (!raw) return null;

//   const start = new Date(raw.start_date);
//   const end = new Date(raw.end_date);
//   const days = Math.max(
//     1,
//     Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
//   );

//   return {
//     id: raw.id,
//     name: raw.name,
//     description: raw.description || "",
//     images: raw.images?.length ? raw.images : [],
//     source_id: raw.source_id,
//     destination_id: raw.destination_id,
//     provider: {
//       name: raw.operator.name || "Unknown",
//       phone_number:
//         raw.operator?.phone_number || raw.operator_phone || raw.phone,
//       email: raw.operator?.email || raw.operator_email || raw.email,
//       rating: 4.8,
//       reviewCount: 0,
//     },
//     priceFrom: Number(
//       raw.price_categories?.find(
//         (c) => c.category?.toLowerCase() === "base price",
//       )?.price || raw.price,
//     ),
//     price_categories: raw.price_categories || [],
//     duration: `${days}`,
//     groupSize: raw.total_seats || 0,
//     difficulty: raw.difficulty || "N/A",
//     hotelCategory: raw.hotel_category || 0,
//     rating: 4.7,
//     reviewCount: 0,
//     verified: true,
//     type: "Adventure",
//     startDate: raw.start_date,
//     highlights: raw.itinerary || [],
//     inclusions: raw.inclusions || [],
//     exclusions: raw.exclusions || [],
//     cancellation_policy: raw.cancellation_policy || "",
//   };
// };

// async function getLocations() {
//   try {
//     const res = await fetch(`${BASE_URL}/api/${API_VERSION}/locations`, {
//       next: { revalidate: 0 },
//     });
//     const data = await res.json();
//     const map = {};
//     if (data.success && data.result?.locations) {
//       data.result.locations.forEach((loc) => {
//         map[loc.id] = { name: loc.name, region: loc.region };
//       });
//     }
//     return map;
//   } catch (e) {
//     return {};
//   }
// }

// async function getTrip(id) {
//   try {
//     const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips/${id}`, {
//       next: { revalidate: 0 },
//     });
//     const data = await res.json();
//     return mapServerTripData(data);
//   } catch (e) {
//     return null;
//   }
// }

// export async function generateMetadata({ params }) {
//   const { id } = await params;

//   // Fetch both trip and locations concurrently for the metadata
//   const [trip, locationMap] = await Promise.all([getTrip(id), getLocations()]);

//   if (!trip) {
//     return {
//       title: "Trip Not Found - TripTribe",
//     };
//   }

//   const locationName = locationMap[trip.destination_id]?.name || "India";

//   return {
//     title: `${trip.name} - ${locationName} - TripTribe`,
//     description:
//       trip.description?.slice(0, 160) ||
//       `Join this amazing group trip to ${locationName}. Book now on TripTribe.`,
//     openGraph: {
//       title: `${trip.name} - ${locationName}`,
//       description: trip.description?.slice(0, 160),
//       images: trip.images?.length ? [{ url: trip.images[0] }] : [],
//     },
//   };
// }

// export default async function Page({ params }) {
//   const { id } = await params;

//   // Concurrent fetching
//   const [trip, locationMap] = await Promise.all([getTrip(id), getLocations()]);

//   if (!trip) {
//     notFound();
//   }

//   return <TripDetailClient trip={trip} locationMap={locationMap} />;
// }
import TripDetailClient from "./TripDetailClient";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const mapServerTripData = (tripDataRaw) => {
  if (!tripDataRaw?.success) return null;

  const raw = Array.isArray(tripDataRaw.result?.trips)
    ? tripDataRaw.result.trips[0]
    : tripDataRaw.result;

  if (!raw) return null;

  const start = new Date(raw.start_date);
  const end = new Date(raw.end_date);
  const days = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
  );

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || "",
    images: Array.isArray(raw.images)
      ? raw.images
      : raw.image
        ? [raw.image]
        : [],
    source_id: raw.source_id,
    destination_id: raw.destination_id,
    operator_id: raw.operator_id || raw.operator?.id || null,
    provider: {
      name: raw.operator?.name || "Unknown",
      phone_number:
        raw.operator?.phone_number || raw.operator_phone || raw.phone || "",
      email: raw.operator?.email || raw.operator_email || raw.email || "",
      logo: null,
      rating: 4.8,
      reviewCount: 0,
    },
    priceFrom: Number(
      raw.price_categories?.find(
        (c) => c.category?.toLowerCase() === "base price",
      )?.price ||
        raw.price ||
        0,
    ),
    price_categories: raw.price_categories || [],
    duration: String(days),
    groupSize: raw.total_seats || 0,
    difficulty: raw.difficulty || "N/A",
    hotelCategory: raw.hotel_category ?? null,
    rating: 4.7,
    reviewCount: 0,
    verified: true,
    type: raw.trip_type?.name || raw.type?.name || "Adventure",
    type_name: raw.trip_type?.name || raw.type?.name || "Adventure",
    startDate: raw.start_date,
    highlights: raw.itinerary || [],
    inclusions: raw.inclusions || [],
    exclusions: raw.exclusions || [],
    cancellation_policy: raw.cancellation_policy || "",
    batches: raw.batches || [],
  };
};

async function fetchJson(url) {
  const res = await fetch(url, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

async function getLocations() {
  try {
    const data = await fetchJson(`${BASE_URL}/api/${API_VERSION}/locations`);

    const map = {};

    if (data?.success && data?.result?.locations) {
      data.result.locations.forEach((loc) => {
        map[loc.id] = {
          name: loc.name,
          region: loc.region,
        };
      });
    }

    return map;
  } catch {
    return {};
  }
}

async function getOperator(operatorId) {
  if (!operatorId) return null;

  try {
    const data = await fetchJson(
      `${BASE_URL}/api/${API_VERSION}/operators/${operatorId}`,
    );

    if (!data?.success || !data?.result) return null;

    return data.result;
  } catch {
    return null;
  }
}

async function getTrip(id) {
  try {
    const data = await fetchJson(`${BASE_URL}/api/${API_VERSION}/trips/${id}`);
    const mappedTrip = mapServerTripData(data);

    if (!mappedTrip) return null;

    const operator = await getOperator(mappedTrip.operator_id);

    return {
      ...mappedTrip,
      provider: {
        ...mappedTrip.provider,
        name: operator?.name || mappedTrip.provider.name,
        phone_number:
          operator?.phone_number || mappedTrip.provider.phone_number,
        email: operator?.email || mappedTrip.provider.email,
        logo: operator?.logo_url || null,
      },
    };
  } catch {
    return null;
  }
}

async function getTripPageData(id) {
  const [trip, locationMap] = await Promise.all([getTrip(id), getLocations()]);

  return {
    trip,
    locationMap,
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { trip, locationMap } = await getTripPageData(id);

  if (!trip) {
    return {
      title: "Trip Not Found - TripTribe",
    };
  }

  const locationName = locationMap?.[trip.destination_id]?.name || "India";

  return {
    title: `${trip.name} - ${locationName} - TripTribe`,
    description:
      trip.description?.slice(0, 160) ||
      `Join this amazing group trip to ${locationName}. Book now on TripTribe.`,
    openGraph: {
      title: `${trip.name} - ${locationName}`,
      description:
        trip.description?.slice(0, 160) ||
        `Join this amazing group trip to ${locationName}.`,
      images: trip.images?.length ? [{ url: trip.images[0] }] : [],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const { trip, locationMap } = await getTripPageData(id);

  if (!trip) {
    notFound();
  }

  return <TripDetailClient trip={trip} locationMap={locationMap} />;
}
