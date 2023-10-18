"use client"

import * as React from "react"
import { addDays, format, getMonth, startOfToday } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  range: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ range, onChange, className }: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !range && "text-muted-foreground", className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {range && range.from
              ? range.to
                ? `${format(range.from, "PPP") }– ${format(range.to, "PPP")}`
                : `${format(range.from, "PPP")} –`
              : "Pick a date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={new Date()}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
