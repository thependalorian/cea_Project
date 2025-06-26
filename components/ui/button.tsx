/**
 * Button UI Component
 * Purpose: Reusable button component with DaisyUI styling
 * Location: /components/ui/button.tsx
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'btn',
  {
    variants: {
      variant: {
        default: 'btn-primary',
        destructive: 'btn-error',
        outline: 'btn-outline',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        link: 'btn-link',
      },
      size: {
        default: 'btn-md',
        sm: 'btn-sm',
        lg: 'btn-lg',
        xs: 'btn-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants } 