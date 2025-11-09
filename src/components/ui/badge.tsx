import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        standard:
          "bg-white/5 border-white/10 text-white/70 pt-1 pr-3 pb-1 pl-3 text-[11px] font-medium",
        premium:
          "border-gradient before:rounded-full bg-white/5 border-white/10 text-white/70 pt-1 pr-3 pb-1 pl-3 text-[11px] font-medium",
        accent:
          "bg-emerald-500/10 border-emerald-400/30 text-emerald-400 pt-1 pr-3 pb-1 pl-3 text-[11px] font-medium",
      },
    },
    defaultVariants: {
      variant: "standard",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
