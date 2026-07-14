import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  
  // Basic shadcn-like variants adapted for FlightBook's theme
  const variants = {
    default: "bg-[#0059FF] text-white hover:bg-[#3B82F6] shadow-md",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "hover:bg-white/10 hover:text-white text-[#94A3B8]",
    link: "text-[#3B82F6] underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
