const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export async function fetchOperators(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.set(key, value);
    }
  });

  const url = `${BASE_URL}/api/${API_VERSION}/operators${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("fetchOperators failed:", error);
    return null;
  }
}
