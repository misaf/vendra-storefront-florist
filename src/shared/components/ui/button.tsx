import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:translate-y-px aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/92 hover:shadow-md hover:shadow-primary/15",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border bg-card/70 shadow-none hover:border-primary/35 hover:bg-card hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      /**
       * Heights state what actually renders. Every `[data-slot="button"]` is
       * floored at 2.75rem in globals.css for a fingertip-sized target, so the
       * old h-9 / h-10 / size-8 / size-9 / size-10 values were all being lifted
       * to 44px anyway — five variants that looked identical on screen while
       * the API advertised a scale. `sm` is now a padding step, not a height
       * step, and `lg` is the one genuinely taller control.
       */
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-11 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-7 has-[>svg]:px-5",
        /* px, like the floor in globals.css: an icon-only control holds no text
           to read, so scaling it with the reader's font size only consumes the
           row it sits in. Its glyph still scales, up to the box. */
        icon: "size-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
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
