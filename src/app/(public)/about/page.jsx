import AboutClient from "./AboutClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "About TripTribe - Making Community Travel Discoverable",
  description:
    "We aggregate community-led trips from verified providers so travelers can search, compare, and book with confidence.",
};

async function getOperatorCount() {
  try {
    const res = await fetch(`${BASE_URL}/api/${API_VERSION}/operators`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await res.json();
    return data?.result?.pagination?.total || 0;
  } catch (e) {
    console.error("Failed to fetch operator count:", e);
    return 0;
  }
}

export default async function Page() {
  const operatorCount = await getOperatorCount();

  return <AboutClient operatorCount={operatorCount} />;
}
