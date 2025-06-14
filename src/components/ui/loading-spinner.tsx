
import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4 border-2",
      md: "h-8 w-8 border-3", 
      lg: "h-12 w-12 border-4"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full border-solid animate-dass-spin",
          sizeClasses[size],
          className
        )}
        style={{
          borderColor: '#003366 transparent #003366 transparent'
        }}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
