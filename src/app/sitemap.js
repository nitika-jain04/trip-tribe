const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default async function sitemap() {
  const SITE_URL = "https://triptribe.co";

  // 1. Fetch all trips for dynamic sitemap generation
  let trips = [];
  try {
    const response = await fetch(
      `${BASE_URL}/api/${API_VERSION}/trips?limit=1000`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    );
    const data = await response.json();
    if (data.success && data.result?.trips) {
      trips = data.result.trips;
    }
  } catch (error) {
    console.error("Sitemap fetch error:", error);
  }

  // 2. Define static routes
  const staticRoutes = [
    "",
    "/trips",
    "/partners",
    "/about",
    "/contact",
    "/privacy",
    "/termsofuse",
    "/disclaimer",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // 3. Map trips to sitemap format
  const tripRoutes = trips.map((trip) => ({
    url: `${SITE_URL}/trip/${trip.id}`,
    lastModified: new Date(trip.updated_at || trip.created_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...tripRoutes];
}
