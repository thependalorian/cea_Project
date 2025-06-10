import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-ios-lg border border-sand-gray/30 bg-white px-4 py-3 text-ios-body font-sf-pro shadow-ios-subtle transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-ios-caption-1 file:font-sf-pro file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-spring-green focus:ring-2 focus:ring-spring-green/30 focus:shadow-ios-normal",
        "placeholder:text-midnight-forest/50 selection:bg-spring-green selection:text-midnight-forest",
        "aria-invalid:ring-ios-red/20 aria-invalid:border-ios-red dark:aria-invalid:ring-ios-red/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
