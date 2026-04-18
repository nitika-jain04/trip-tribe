import { useMemo, useCallback } from "react";
import useSWR from "swr";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const LOCATIONS_URL = `${BASE_URL}/api/${API_VERSION}/locations`;

const fetcher = async (url) => {
  const res = await fetch(url);

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || !data?.success) {
    throw new Error(
      data?.error?.message || data?.message || "Failed to fetch locations",
    );
  }

  return data;
};

const useLocations = () => {
  const { data, error, isLoading, mutate } = useSWR(LOCATIONS_URL, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const locations = data?.result?.locations || [];

  const locationMap = useMemo(() => {
    const map = {};
    locations.forEach((loc) => {
      map[loc.id] = {
        name: loc.name,
        region: loc.region,
      };
    });
    return map;
  }, [locations]);

  const refreshLocations = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    locations,
    locationMap,
    loading: isLoading,
    error: error?.message || null,
    refreshLocations,
  };
};

export default useLocations;
