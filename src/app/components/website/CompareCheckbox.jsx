import React from "react";
import { Checkbox } from "@/app/components/ui/checkbox";

export default function CompareCheckbox({ tripId, isCompared, onToggleCompare }) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleCompare();
      }}
    >
      <Checkbox
        id={`compare-${tripId}`}
        checked={isCompared}
        onCheckedChange={onToggleCompare}
        onClick={(e) => e.stopPropagation()}
      />
      <label
        htmlFor={`compare-${tripId}`}
        className="text-body-sm text-muted-foreground cursor-pointer"
      >
        Compare
      </label>
    </div>
  );
}
