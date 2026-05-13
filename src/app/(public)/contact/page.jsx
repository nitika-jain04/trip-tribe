import { fetchOperators } from "@/app/utils/operators";
import ContactClient from "./ContactClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "Contact Us - TripTribe",
  description:
    "Have questions about group trips, partnerships, or travel communities? Get in touch with the TripTribe team.",
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
    return null;
  }
}

export default async function Page() {
  const [initialTrips, initialOperators] = await Promise.all([
    fetchData(`${BASE_URL}/api/${API_VERSION}/trips`),
    fetchOperators(),
  ]);

  return (
    <ContactClient
      initialTrips={initialTrips}
      initialOperators={initialOperators}
    />
  );
}
