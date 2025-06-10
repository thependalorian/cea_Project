import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-ios-full border px-3 py-1 text-ios-caption-1 font-sf-pro-rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-spring-green text-midnight-forest shadow-ios-subtle hover:bg-spring-green/80",
        secondary:
          "border-transparent bg-moss-green text-white shadow-ios-subtle hover:bg-moss-green/80",
        destructive:
          "border-transparent bg-ios-red text-white shadow-ios-subtle hover:bg-ios-red/80",
        outline: "border-spring-green text-spring-green hover:bg-spring-green/10",
        glass: "border-white/25 bg-white/15 backdrop-blur-ios text-midnight-forest shadow-ios-subtle hover:bg-white/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
