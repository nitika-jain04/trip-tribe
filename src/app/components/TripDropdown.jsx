"use client";
import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Check } from "lucide-react";

export default function TripDropdown({
  options,
  value,
  onChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-500"
      >
        {value || placeholder}
        <MdKeyboardArrowDown
          size={20}
          className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-blue-100 ${
                  selected
                    ? "bg-blue-500 text-white hover:bg-blue-500"
                    : "text-gray-700"
                }`}
              >
                {selected && <Check size={16} />}
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
