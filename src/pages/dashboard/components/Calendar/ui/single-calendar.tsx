import * as React from "react";
import { DayPicker } from "react-day-picker";
import type { PropsSingle, PropsBase } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

// react-day-picker v9 — classNames and components API changed from v8
type SingleCalendarProps = PropsBase & PropsSingle;

function SingleCalendar({ className, classNames, showOutsideDays = true, selected, mode: _mode, ...props }: SingleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(
    selected instanceof Date ? selected : undefined
  );

  return (
    <DayPicker
      mode="single"
      selected={selected}
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-3", className)}
      classNames={{
        // v9 classNames (renamed from v8)
        months:          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month:           "space-y-4",
        month_caption:   "flex justify-center pt-1 relative items-center",   // was: caption
        caption_label:   "text-sm font-medium",
        nav:             "space-x-1 flex items-center",
        button_previous: cn(                                                  // was: nav_button_previous
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(                                                      // was: nav_button_next
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid:  "w-full border-collapse space-y-1",                     // was: table
        weekdays:    "flex",                                                  // was: head_row
        weekday:     "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]", // was: head_cell
        week:        "flex w-full mt-2",                                     // was: row
        day: cn(                                                              // was: cell
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].outside)]:bg-accent/50",
          "[&:has([aria-selected].range-end)]:rounded-r-md [&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(                                                       // was: day (the button)
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start:   "range-start",                                        // was: day_range_start
        range_end:     "range-end",                                          // was: day_range_end
        selected:      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground", // was: day_selected
        today:         "bg-accent text-accent-foreground",                   // was: day_today
        outside:       "outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground", // was: day_outside
        disabled:      "text-muted-foreground opacity-50",                   // was: day_disabled
        range_middle:  "aria-selected:bg-accent aria-selected:text-accent-foreground", // was: day_range_middle
        hidden:        "invisible",                                          // was: day_hidden
        ...classNames,
      }}
      components={{
        // v9 uses a single Chevron component with orientation prop
        // was: IconLeft / IconRight
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" {...rest} />
          ),
      }}
      {...props}
    />
  );
}
SingleCalendar.displayName = "Calendar";

export { SingleCalendar };
