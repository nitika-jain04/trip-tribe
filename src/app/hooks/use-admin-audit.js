import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

/**
 * Hook to fetch audit logs with filters from the admin API.
 */
export const useAdminAudit = (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.append(key, value);
    }
  });

  const url = `${BASE_URL}/api/${API_VERSION}/audit?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, adminFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false
  });

  return {
    logs: data?.result?.logs || [],
    pagination: data?.result?.pagination || { total: 0, pages: 1 },
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate
  };
};
