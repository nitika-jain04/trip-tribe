import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

/**
 * Hook to fetch admin-side locations (destinations) with filters.
 */
export const useAdminLocations = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.order) params.append("order", filters.order);

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "sortBy" || key === "order") return;
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.append(key, value);
    }
  });

  const url = `${BASE_URL}/api/${API_VERSION}/locations/admin?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, adminFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false
  });

  return {
    locations: data?.result?.locations || [],
    pagination: data?.result?.pagination || { total: 0, pages: 1 },
    isLoading,
    error: error?.message,
    mutate
  };
};

/**
 * Hook to fetch admin-side trip types (categories) with filters.
 */
export const useAdminTripTypes = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.append(key, value);
    }
  });

  const url = `${BASE_URL}/api/${API_VERSION}/trip-types/admin?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, adminFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false
  });

  return {
    categories: data?.result?.trip_types || [],
    pagination: data?.result?.pagination || { total: 0, pages: 1 },
    isLoading,
    error: error?.message,
    mutate
  };
};
