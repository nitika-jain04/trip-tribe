import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useTripTypes = (params = { status: "ACTIVE" }) => {
  // Handle both string (deprecated) and object parameters
  const isObject = typeof params === "object" && params !== null;
  const status = isObject ? params.status : "ACTIVE";
  const page = isObject ? params.page : 1;
  const limit = isObject ? params.limit : 10;

  const query = new URLSearchParams();
  if (status && status !== "ALL") {
    query.set("is_active", status === "ACTIVE");
  }
  query.set("page", page);
  query.set("limit", limit);

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/api/${API_VERSION}/trip-types/admin?${query.toString()}`,
    adminFetcher,
    {
      revalidateOnFocus: false, 
      dedupingInterval: 60000, 
    }
  );

  return {
    tripTypes: data?.result?.trip_types || [],
    pagination: data?.result?.pagination || {},
    loadingTripTypes: isLoading,
    error: error?.message || null,
    refreshTripTypes: mutate,
  };
};

export default useTripTypes;
