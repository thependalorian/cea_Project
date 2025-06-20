import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-ios-button text-ios-subheadline font-sf-pro font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spring-green/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-spring-green text-midnight-forest hover:bg-spring-green/90 shadow-ios-subtle hover:shadow-ios-normal",
        destructive:
          "bg-ios-red text-white hover:bg-ios-red/90 shadow-ios-subtle hover:shadow-ios-normal",
        outline:
          "border-2 border-spring-green bg-transparent text-spring-green hover:bg-spring-green/10 hover:text-midnight-forest shadow-ios-subtle",
        secondary:
          "bg-moss-green text-white hover:bg-moss-green/80 shadow-ios-subtle hover:shadow-ios-normal",
        ghost: "hover:bg-spring-green/10 hover:text-spring-green",
        link: "text-spring-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-ios-button px-3 text-ios-caption-1",
        lg: "h-11 rounded-ios-button px-8 text-ios-headline",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
