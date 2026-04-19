import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useAdminOperators = (filters = "APPROVED") => {
  const query = new URLSearchParams();

  if (typeof filters === "object" && filters !== null) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "ALL" &&
        value !== "all"
      ) {
        query.set(key, value);
      }
    });
  } else {
    // Legacy support for string input (deprecated)
    if (filters && filters !== "ALL" && filters !== "all") {
      query.set("application_status", filters);
    }
  }

  // Set defaults if not present
  if (!query.has("page")) query.set("page", "1");
  if (!query.has("limit")) query.set("limit", "10");

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/api/${API_VERSION}/operators/admin?${query.toString()}`,
    adminFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    },
  );

  return {
    operators: data?.result?.operators || [],
    pagination: data?.result?.pagination || {},
    loadingOperators: isLoading,
    error: error?.message || null,
    refreshOperators: mutate,
  };
};

export default useAdminOperators;
