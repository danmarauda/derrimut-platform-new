import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        // Primary Button - Light button (main CTA)
        primary:
          "border-gradient before:rounded-2xl bg-zinc-100 text-zinc-900 hover:bg-white px-4 sm:px-5 py-3 rounded-2xl tracking-tight transition-all hover:-translate-y-0.5 shadow-sm",
        // Secondary Button - Glassmorphic with border gradient
        secondary:
          "border-gradient before:rounded-2xl hover:bg-white/10 transition-all hover:-translate-y-0.5 text-sm text-white tracking-tight rounded-2xl pt-3 pr-4 pb-3 pl-4 gap-2 items-center justify-center backdrop-blur-sm",
        // Tertiary Button - Simple glassmorphic
        tertiary:
          "bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur transition-colors",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
