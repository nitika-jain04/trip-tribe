import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const base_url = "https://trip-tribe-backend.onrender.com";

export const api_version = "v1";
