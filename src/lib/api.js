import { jwtDecode } from "jwt-decode";

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // 🔐 Token missing
  if (!token) {
    logout();
    throw new Error("Unauthorized");
  }

  // 🔐 Token expiry check
  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      logout();
      throw new Error("Token expired");
    }
  } catch {
    logout();
    throw new Error("Invalid token");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // 🔥 Backend rejected token
  if (res.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }

  // ❌ Other API errors
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "API Error");
  }

  // ✅ Success
  return res.json();
};

const logout = () => {
  localStorage.removeItem("token");
  window.location.replace("/");
};
