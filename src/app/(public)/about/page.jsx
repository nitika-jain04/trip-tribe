import AboutClient from "./AboutClient";

import { fetchOperators } from "@/app/utils/operators";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const metadata = {
  title: "About TripTribe - Making Community Travel Discoverable",
  description:
    "Learn about TripTribe's mission to aggregate India's best community trips, verified providers, and authentic travel experiences.",
};

export default async function About() {
  const operatorData = await fetchOperators({ page: 1, limit: 1 });
  const operatorCount = operatorData?.result?.pagination?.total || 0;

  return <AboutClient operatorCount={operatorCount} />;
}
