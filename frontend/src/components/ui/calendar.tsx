"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-background border rounded-lg shadow-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-2 z-0",
        caption_label: "text-sm font-semibold",
        nav: "space-x-1 flex items-center absolute w-full justify-between left-0 px-2 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 p-0 hover:bg-muted transition-colors rounded-full flex items-center justify-center bg-background shadow-sm"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 p-0 hover:bg-muted transition-colors rounded-full flex items-center justify-center bg-background shadow-sm"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex mb-2",
        weekday: "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] text-center",
        week: "flex w-full mt-1",
        day: "h-10 w-10 text-center text-sm p-0 raltive flex items-center justify-center",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-all rounded-md"
        ),
        today: "bg-accent text-accent-foreground font-bold",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        outside: "text-muted-foreground opacity-30",
        disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
