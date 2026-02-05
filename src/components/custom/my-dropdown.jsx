"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom component that matches your exact structure
export function CustomRadioDropdown({
  triggerText = "Open",
  width = "w-2",
  defaultPosition = "bottom",
  positionOptions = [
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" },
    { value: "right", label: "Right" },
  ],
  onPositionChange,
  buttonVariant = "outline",
}) {
  const [position, setPosition] = useState(defaultPosition);

  const handleValueChange = (value) => {
    setPosition(value);
    if (onPositionChange) {
      onPositionChange(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant}>{triggerText}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={width}>
        <DropdownMenuGroup>
          {/* <DropdownMenuLabel>{labelText}</DropdownMenuLabel> */}
          <DropdownMenuRadioGroup
            value={position}
            onValueChange={handleValueChange}
          >
            {positionOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
