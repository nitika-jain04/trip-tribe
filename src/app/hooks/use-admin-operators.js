import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useAdminOperators = (params = "APPROVED") => {
  // Handle both string (deprecated) and object parameters
  const isObject = typeof params === "object" && params !== null;
  const status = isObject ? params.status : params;
  const page = isObject ? params.page : 1;
  const limit = isObject ? params.limit : 10;

  const query = new URLSearchParams();
  if (status && status !== "ALL") {
    query.set("application_status", status);
  }
  query.set("page", page);
  query.set("limit", limit);

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
