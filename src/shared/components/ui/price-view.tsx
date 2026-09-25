import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/**
 * A price is set in the display face, in the clay accent, at every size. That
 * pairing is what makes the number read as the shop's own voice rather than as
 * a data field, and it is the one treatment the Organic system applies
 * identically on a catalogue tile, a cart line and a product masthead — so the
 * variants below change only the step, never the face or the colour.
 */
const priceVariants = cva(
  "font-display inline-flex flex-wrap items-baseline gap-x-2 text-rose",
  {
    variants: {
      size: {
        sm: "gap-x-2 text-sm leading-5",
        md: "gap-x-2 text-base leading-6",
        lg: "gap-x-3 gap-y-1 text-3xl sm:text-4xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const originalVariants = cva("font-medium text-muted-foreground decoration-1", {
  variants: {
    size: {
      sm: "text-xs font-normal",
      md: "text-sm",
      lg: "text-base sm:text-lg",
    },
  },
  defaultVariants: { size: "md" },
})

interface PriceViewProps extends VariantProps<typeof priceVariants> {
  /** The current price, already formatted for the locale. */
  value: React.ReactNode
  /** The price it was struck down from; pass only when there is a live sale. */
  originalValue?: React.ReactNode
  /** Visually hidden words that introduce each price to a screen reader. */
  priceLabel?: string
  saleLabel?: string
  originalLabel?: string
  className?: string
  /** Applied to the current price itself, for per-surface truncation. */
  valueClassName?: string
}

/**
 * The drawn half of the storefront's `Price`: it formats nothing and decides
 * nothing, it only sets the two numbers it is handed. Both are real text, each
 * introduced by a visually hidden word, so a reduction is spoken as well as
 * drawn — see `Price` for the accessibility bug that shape fixes.
 */
function PriceView({
  value,
  originalValue,
  size,
  priceLabel = "Price",
  saleLabel = "Sale price",
  originalLabel = "Original price",
  className,
  valueClassName,
}: PriceViewProps) {
  const hasDiscount = originalValue != null && originalValue !== ""

  return (
    <span
      data-slot="price"
      className={cn(priceVariants({ size }), className)}
      dir="ltr"
    >
      <span className="sr-only">{hasDiscount ? saleLabel : priceLabel}: </span>
      <span className={cn("tabular-nums", valueClassName)}>{value}</span>
      {hasDiscount ? (
        <>
          <span className="sr-only">{originalLabel}: </span>
          <del className={cn(originalVariants({ size }), "tabular-nums")}>
            {originalValue}
          </del>
        </>
      ) : null}
    </span>
  )
}

export { PriceView, priceVariants }
