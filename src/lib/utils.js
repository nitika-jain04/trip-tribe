import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `+91 ${digits.slice(-10)}`;
};

export const getDialablePhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `+91${digits.slice(-10)}`;
};
