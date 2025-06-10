/**
 * Textarea Component - ACT Brand Demo
 * 
 * Purpose: Provides a reusable textarea input component with consistent styling
 * Location: act-brand-demo/components/ui/textarea.tsx
 * 
 * Uses DaisyUI for consistent styling across the application.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "textarea textarea-bordered w-full min-h-[80px] resize-y",
          "focus:textarea-primary disabled:textarea-disabled",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 