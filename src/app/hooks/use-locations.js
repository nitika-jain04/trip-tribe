import { useEffect, useState, useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// 🧊 Module-level cache to persist across component mounts and routes
let cachedLocations = null;
let cachedLocationMap = null;
let listeners = new Set();

let fetchPromise = null;

/**
 * Hook to share and cache destination data across the entire application.
 * Reduces API calls by reusing location data between Home Page and Trip Details.
 */
const useLocations = () => {
  const [locations, setLocations] = useState(cachedLocations || []);
  const [locationMap, setLocationMap] = useState(cachedLocationMap || {});
  const [loading, setLoading] = useState(!cachedLocations);
  const [error, setError] = useState(null);

  const updateState = useCallback((newLocations, newMap) => {
    setLocations(newLocations);
    setLocationMap(newMap);
    setLoading(false);
  }, []);

  // Subscribe to updates from other instances of this hook
  useEffect(() => {
    const listener = (newLocations, newMap) => {
      updateState(newLocations, newMap);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [updateState]);

  const fetchLocations = useCallback(async (force = false) => {
    // ✋ Skip if already cached
    if (!force && cachedLocations) {
      updateState(cachedLocations, cachedLocationMap);
      return;
    }

    // 🤝 If a fetch is already in progress, wait for it
    if (!force && fetchPromise) {
      setLoading(true);
      try {
        await fetchPromise;
        // After resolving, cache will definitely be populated
        if (cachedLocations) {
          updateState(cachedLocations, cachedLocationMap);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    fetchPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/locations`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error?.message || "Failed to fetch locations");
        }

        const rawLocations = data.result?.locations || [];
        const newMap = {};
        rawLocations.forEach((loc) => {
          newMap[loc.id] = {
            name: loc.name,
            region: loc.region,
          };
        });

        // 🧊 Update module-level cache
        cachedLocations = rawLocations;
        cachedLocationMap = newMap;

        // 📣 Notify all listening hook instances
        listeners.forEach((listener) => listener(rawLocations, newMap));
        
        updateState(rawLocations, newMap);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError(err.message);
        setLoading(false);
        throw err; // rethrow so listeners waiting catch it
      } finally {
        fetchPromise = null;
      }
    })();

    try {
      await fetchPromise;
    } catch (err) {
      // Handled above
    }
  }, [updateState]);

  // Initial fetch on mount if empty
  useEffect(() => {
    if (!cachedLocations) {
      fetchLocations();
    }
  }, [fetchLocations]);

  // Function to manually trigger a refetch (used by Admin)
  const refreshLocations = useCallback(() => {
    return fetchLocations(true);
  }, [fetchLocations]);

  return {
    locations,
    locationMap,
    loading,
    error,
    refreshLocations,
  };
};

export default useLocations;
