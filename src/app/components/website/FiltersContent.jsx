"use client";

import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { Slider } from "@/app/components/ui/slider";

export default function FiltersContent({
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedOperator,
  setSelectedOperator,
  operators,
  setIsSheetOpen,
  tripTypesData,
  setCurrentPage,
  priceRange,
  setPriceRange,
  appliedPriceRange,
  setAppliedPriceRange,
  scrollToFilters,
  maxPrice = Infinity,
}) {
  const p0 = priceRange[0] === "" ? "" : Number(priceRange[0]);
  const p1 = priceRange[1] === "" ? "" : Number(priceRange[1]);

  const isApplyDisabled =
    p0 === "" ||
    p1 === "" ||
    (p0 === appliedPriceRange[0] && p1 === appliedPriceRange[1]) ||
    p0 < 0 ||
    p1 < 0 ||
    p1 <= p0;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-foreground mb-3">Trip Type</h4>
        <div className="space-y-1">
          {tripTypesData.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedType.id === type.id
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedType.id === type.id && (
                <motion.div
                  layoutId="activeType"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-3">
          Select Price Range
        </h4>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex-1 relative mt-2">
              <span className="absolute -top-2 left-3 bg-background px-1 text-[10px] text-muted-foreground z-10">
                Min. Amount
              </span>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceRange([val === "" ? "" : Number(val), priceRange[1]]);
                }}
                className="w-full h-12 rounded-lg border-muted-foreground/30 bg-transparent px-3 text-body-md"
              />
            </div>
            <div className="flex-1 relative mt-2">
              <span className="absolute -top-2 left-3 bg-background px-1 text-[10px] text-muted-foreground z-10">
                Max. Amount
              </span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceRange([priceRange[0], val === "" ? "" : Number(val)]);
                }}
                className="w-full h-12 rounded-lg border-muted-foreground/30 bg-transparent px-3 text-body-md"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-1">
            <Slider
              max={Math.max(maxPrice, p1 || 0)}
              step={100}
              value={[p0 || 0, p1 || 0]}
              onValueChange={setPriceRange}
              className="w-full"
            />
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAppliedPriceRange([p0 || 0, p1 || 0]);
              setCurrentPage(1);
              setIsSheetOpen?.(false);
              scrollToFilters?.();
            }}
            disabled={isApplyDisabled}
            className="w-full mt-4 btn-primary"
          >
            Apply
          </Button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-3">Difficulty</h4>
        <div className="space-y-1">
          {["All", "Easy", "Moderate", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedDifficulty === diff
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedDifficulty === diff && (
                <motion.div
                  layoutId="activeDifficulty"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{diff}</span>
            </button>
          ))}
        </div>
      </div>

      {operators?.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Operator</h4>
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedOperator("All");
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedOperator === "All"
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedOperator === "All" && (
                <motion.div
                  layoutId="activeOperator"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">All Operators</span>
            </button>
            {operators.map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  setSelectedOperator(op.id);
                  setCurrentPage(1);
                  setIsSheetOpen?.(false);
                  scrollToFilters?.();
                }}
                className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                  selectedOperator === op.id
                    ? "text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {selectedOperator === op.id && (
                  <motion.div
                    layoutId="activeOperator"
                    className="absolute inset-0 bg-primary rounded-lg z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{op.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
