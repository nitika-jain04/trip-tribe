const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export async function fetchOperatorsCount() {
  try {
    const res = await fetch(`${BASE_URL}/api/${API_VERSION}/operators`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    if (data?.success && data?.result?.pagination?.total) {
      return data.result.pagination.total;
    }
  } catch (error) {
    console.error("Failed to fetch operators count:", error);
  }
  return 10; // Fallback
}
