import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  try {
    // Ensure the number starts with + for parsing
    const input = phone.startsWith("+") ? phone : `+${phone}`;
    const parsed = parsePhoneNumberFromString(input);
    if (parsed) {
      return parsed.formatInternational(); // e.g. "+91 98765 43210"
    }
  } catch {
    // fall through to manual fallback
  }
  // Fallback: if parsing fails, just add a space after country code
  if (phone.startsWith("+")) return phone;
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
