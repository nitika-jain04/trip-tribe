import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Rating = React.forwardRef(({ className, value = 0, max = 5, onChange, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange?.(starValue)}
            className={cn(
              "p-0.5 hover:scale-110 transition-all outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              !onChange && "cursor-default hover:scale-100"
            )}
            disabled={!onChange}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                value >= starValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-200 hover:text-yellow-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
});
Rating.displayName = "Rating";

export { Rating };
