import Cookies from "js-cookie";

/**
 * Validatable fetcher specialized for admin API routes.
 * Automatically injects the Authorization Bearer token into all requests.
 */
export const adminFetcher = async (url) => {
  const token = Cookies.get("token");

  // Always attempt fetch with credentials gracefully
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  // Treat explicit failures or non-200 OK statuses as throwing errors so SWR knows
  if (!res.ok || (data && data.success === false)) {
    throw new Error(
      data?.error?.message || data?.message || "Failed to fetch admin data",
    );
  }

  return data;
};
