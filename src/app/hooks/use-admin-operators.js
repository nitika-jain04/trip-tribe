import useSWR from "swr";
import { adminFetcher } from "./use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useAdminOperators = (status = "APPROVED") => {
  // Pass dynamic query string parameters
  const query = new URLSearchParams();
  if (status && status !== "ALL") {
    query.set("application_status", status);
  }

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}/api/${API_VERSION}/operators/admin?${query.toString()}`,
    adminFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, 
    }
  );

  return {
    operators: data?.result?.operators || [],
    loadingOperators: isLoading,
    error: error?.message || null,
    refreshOperators: mutate,
  };
};

export default useAdminOperators;
