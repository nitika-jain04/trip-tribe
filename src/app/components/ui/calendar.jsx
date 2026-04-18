import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../../components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col items-center",
        month: "w-full space-y-4",

        caption: "flex items-center justify-center relative mb-2",
        caption_label: "text-sm font-semibold text-slate-800",

        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-md transition",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        table: "w-full border-collapse",

        head_row: "grid grid-cols-7 mb-1",
        head_cell:
          "text-[11px] font-medium text-slate-400 text-center uppercase tracking-wide",

        row: "grid grid-cols-7",

        cell: "h-10 w-10 flex items-center justify-center",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-slate-700 rounded-md hover:bg-slate-100 transition",
        ),

        day_selected:
          "bg-slate-900 text-white hover:bg-slate-800 focus:bg-slate-900",

        day_today: "border border-slate-300 text-slate-900 font-semibold",

        day_outside: "text-slate-300 opacity-50",

        day_disabled: "text-slate-300 opacity-40 cursor-not-allowed",

        day_range_middle: "bg-slate-100 text-slate-900",

        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
