export const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || "An error occurred while fetching the data.");
  }
  return data;
};
