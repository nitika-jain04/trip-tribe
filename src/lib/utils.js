import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  // If already has country code (starts with +), return as-is
  if (phone.startsWith("+")) return phone;
  // Legacy fallback: assume Indian number
  const digits = phone.replace(/\D/g, "");
  return `+91 ${digits.slice(-10)}`;
};

export const getDialablePhone = (phone) => {
  if (!phone) return "";
  // If already has country code (starts with +), strip non-digits but keep +
  if (phone.startsWith("+")) return `+${phone.replace(/\D/g, "")}`;
  // Legacy fallback: assume Indian number
  const digits = phone.replace(/\D/g, "");
  return `+91${digits.slice(-10)}`;
};
