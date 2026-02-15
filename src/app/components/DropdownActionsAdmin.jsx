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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer text-sm text-admin-dark"
      >
        {labelText}
      </button>

      {isOpen && (
        <div
          className="absolute right-5 -bottom-6 bg-white border border-gray-200 rounded-sm flex flex-col w-40 px-1 py-1 z-9999"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((op) => {
            const isSelected = selected.value === op.value;

            return (
              <button
                key={op.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(op);
                  setIsOpen(false);
                  // Call the onClick handler if it exists
                  if (op.onClick) {
                    op.onClick();
                  }
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
