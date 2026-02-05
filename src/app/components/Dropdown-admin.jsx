"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Check } from "lucide-react";

function Dropdownadmin({ options, onSelect, selectedValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(options[0]);
  const dropdownRef = useRef(null);

  // Initialize selected based on props or internal state
  const selected = selectedValue
    ? options.find((op) => op.value === selectedValue) || options[0]
    : internalSelected;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (op) => {
    setInternalSelected(op);
    if (onSelect) {
      onSelect(op.value); // Send selected value back to parent
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-12 rounded-lg cursor-pointer border border-gray-200 bg-white px-4 py-2 text-sm text-admin-dark"
      >
        {selected.label}
        <MdOutlineKeyboardArrowDown
          className={`transition-transform duration-500 text-admin-haze ${isOpen ? "rotate-180" : ""}`}
          size={20}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute w-full mt-1 rounded-sm border border-gray-200 bg-white p-1 shadow-lg z-50
    transform transition-all duration-300 ease-in-out
    ${
      isOpen
        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
    }`}
        >
          {options.map((op) => {
            const isSelected = selected.value === op.value;

            return (
              <div
                key={op.value}
                onClick={() => handleSelect(op)}
                className="flex items-center gap-2 rounded-sm px-3 py-1 text-sm cursor-pointer transition-transform duration-500 ease-out hover:bg-admin-background hover:text-admin-success"
              >
                <span className="w-3">{isSelected && <Check size={16} />}</span>

                {op.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdownadmin;
