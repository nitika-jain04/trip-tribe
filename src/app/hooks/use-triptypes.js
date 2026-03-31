import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const useTripTypes = () => {
  const [tripTypes, setTripTypes] = useState([]);
  const [loadingTripTypes, setLoadingTripTypes] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripTypes = async () => {
      const token = Cookies.get("token");
      setLoadingTripTypes(true);

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/trip-types/admin?is_active=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error?.message || "Failed to fetch trip types");
        }

        setTripTypes(data.result.trip_types || []);
      } catch (err) {
        console.error("Failed to fetch trip types:", err);
        setError(err.message);
      } finally {
        setLoadingTripTypes(false);
      }
    };

    fetchTripTypes(); // ✅ CALL IT
  }, []);

  return {
    tripTypes,
    loadingTripTypes,
    error,
  };
};

export default useTripTypes;
