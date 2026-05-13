"use client";

import useSWR from "swr";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

/**
 * Reusable hook for fetching operators on the client side using SWR.
 *
 * @param {Object} params - Query parameters (e.g., { page: 1, limit: 10 })
 * @param {Object} initialData - Optional fallback data for SSR/Hydration
 */
export default function useOperators(params = {}, initialData = null) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.set(key, value);
    }
  });

  const key = `${BASE_URL}/api/${API_VERSION}/operators?${query.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch operators");
      return res.json();
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    },
  );

  return {
    operators: data?.result?.operators || [],
    pagination: data?.result?.pagination || {},
    total: data?.result?.pagination?.total || 0,
    isLoading,
    error,
    mutate,
  };
}
