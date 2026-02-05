"use client";

import React, { useState, useRef, useEffect } from "react";

function DropdownActionsAdmin({ labelText, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const dropdownRef = useRef(null);

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

  return (
    <div ref={dropdownRef} className="relative w-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-sm text-admin-dark"
      >
        {labelText}
      </button>

      {isOpen && (
        <div className="absolute right-0.5 bg-white border border-gray-200 rounded-sm flex flex-col gap-1 w-40 px-1 py-2 z-50">
          {options.map((op) => {
            const isSelected = selected.value === op.value;

            return (
              <button
                key={op.value}
                onClick={() => {
                  setSelected(op);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-sm px-3 py-1 text-sm cursor-pointer transition-transform duration-500 ease-out hover:bg-admin-background hover:text-admin-success"
              >
                <span>{op.icon}</span>
                {op.value}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownActionsAdmin;
