"use client";

import React from "react";
import { PhoneInput as ReactPhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

/**
 * A reusable Phone Input component with country code selection and validation.
 * Styled to match the TripTribe design system.
 */
const PhoneInput = ({
  value,
  onChange,
  className,
  error,
  placeholder,
  disabled,
  ...props
}) => {
  return (
    <div className={cn("w-full transition-all duration-200", className)}>
      <ReactPhoneInput
        defaultCountry="in"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="react-international-phone-container w-full"
        inputClassName={cn(
          "flex w-full !rounded-r-lg !border-l-0 border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 !font-sans h-full",
          error ? "!border-error" : "",
          props.inputClassName,
        )}
        countrySelectorStyleProps={{
          buttonClassName: cn(
            "h-full !rounded-l-lg border border-input bg-background px-3 flex items-center justify-center transition-colors !border-r-0",
            error ? "!border-error" : "focus-within:!border-primary",
            props.countrySelectorStyleProps?.buttonClassName,
          ),
          dropdownContainerClassName: cn(
            "z-50",
            props.countrySelectorStyleProps?.dropdownContainerClassName,
          ),
          dropdownArrowClassName: cn(
            "text-muted-foreground",
            props.countrySelectorStyleProps?.dropdownArrowClassName,
          ),
        }}
        {...props}
      />
      {/* Overriding some library styles locally to ensure consistency */}
      <style jsx global>{`
        .react-international-phone-input {
          width: 100% !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          color: var(--foreground) !important;
        }
        .react-international-phone-country-selector-button {
          background-color: var(--background) !important;
          border-color: var(--input) !important;
          width: 60px !important;
        }
        .react-international-phone-country-selector-button:hover {
          background-color: var(--muted) !important;
        }
        .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: var(--muted-foreground) !important;
        }
        .react-international-phone-country-selector-dropdown {
          background-color: var(--background) !important;
          border: 1px solid var(--border) !important;
          border-radius: 0.75rem !important;
          box-shadow: var(--shadow-lg) !important;
          padding: 0.5rem !important;
        }
        .react-international-phone-country-selector-dropdown__list-item {
          color: var(--foreground) !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          transition: background-color 0.2s !important;
        }
        .react-international-phone-country-selector-dropdown__list-item:hover {
          background-color: var(--muted) !important;
        }
        .react-international-phone-country-selector-dropdown__list-item--selected {
          background-color: var(--primary-soft) !important;
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default PhoneInput;
