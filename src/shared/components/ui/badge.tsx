import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        /* The Organic system's `tag-outline`: the accent drawn as a ring
           rather than a fill, for the one tag in a row that is *selected*. */
        outline:
          "border-primary text-primary [a&]:hover:bg-accent",
        /* The three tints. Each pairs a ramp's 100 with its 800, which on a
           shared lightness scale lands every one of them at ~9:1 — so a clay
           tag and a sage tag beside it read at the same weight instead of one
           shouting over the other. */
        clay: "border-transparent bg-clay-100 text-clay-800 [a&]:hover:bg-clay-200",
        sage: "border-transparent bg-sage-100 text-sage-800 [a&]:hover:bg-sage-200",
        sand: "border-transparent bg-sand-100 text-sand-800 [a&]:hover:bg-sand-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
