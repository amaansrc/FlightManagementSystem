import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export function DatePicker({ date, setDate, placeholder = "Pick a date", className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal glass-input hover:bg-white/10",
            !date && "text-[#94A3B8]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateTimePicker({ date, setDate, placeholder = "Pick a date and time", className }) {
  const [selectedTime, setSelectedTime] = React.useState(
    date ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : "12:00"
  )

  const handleDateSelect = (newDate) => {
    if (!newDate) {
      setDate(undefined)
      return
    }
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const updatedDate = setMinutes(setHours(newDate, hours), minutes)
    setDate(updatedDate)
  }

  const handleTimeChange = (e) => {
    const timeValue = e.target.value
    setSelectedTime(timeValue)
    if (date) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      const updatedDate = setMinutes(setHours(date, hours), minutes)
      setDate(updatedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal glass-input hover:bg-white/10",
            !date && "text-[#94A3B8]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center text-sm text-[#94A3B8]">
            <Clock className="mr-2 h-4 w-4" />
            <span>Time</span>
          </div>
          <input
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            className="bg-white/5 border border-white/10 rounded-md text-white text-sm px-2 py-1 focus:outline-none focus:border-[#0059FF]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
