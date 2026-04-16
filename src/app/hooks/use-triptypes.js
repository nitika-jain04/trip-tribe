import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useTripTypes = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/api/${API_VERSION}/trip-types/admin?is_active=true`,
    adminFetcher,
    {
      revalidateOnFocus: false, // Prevents aggressive refetching since reference data rarely changes
      dedupingInterval: 60000, 
    }
  );

  return {
    tripTypes: data?.result?.trip_types || [],
    loadingTripTypes: isLoading,
    error: error?.message || null,
    refreshTripTypes: mutate,
  };
};

export default useTripTypes;
