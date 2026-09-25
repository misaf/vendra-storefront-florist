import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"

import { DynamicText } from "@/shared/components/dynamic-text"
import { cn } from "@/shared/lib/utils"

/** The collection washes, cycled by post so a row of fallbacks has rhythm. */
const WASHES = ["organic-wash-a", "organic-wash-c", "organic-wash-b"] as const

function washFor(seed: string | number): (typeof WASHES)[number] {
  const n = Number.parseInt(String(seed), 10)
  return WASHES[(Number.isFinite(n) ? Math.abs(n) : 0) % WASHES.length]
}

interface BlogPostCardViewProps
  extends Omit<React.ComponentProps<"a">, "children" | "title"> {
  title: string
  /** The kicker above the title; omit to leave it out. */
  category?: string | null
  excerpt?: string | null
  /** Machine-readable date for `<time>`; shown only with `dateLabel`. */
  dateTime?: string | null
  dateLabel?: string | null
  /** The photograph, already sized by the caller. Omit to show the wash. */
  image?: React.ReactNode
  /** Picks which wash sits behind (or instead of) the picture — the post id. */
  washSeed?: string | number
  /** A denser step for the home page's preview rail. */
  compact?: boolean
  /** Render through the child element instead, e.g. a router `<Link />`. */
  asChild?: boolean
  children?: React.ReactElement
}

/**
 * The drawn half of the journal's `BlogPostCard`: a solid plate of the warm
 * surface with the picture bled to its top edge, then a kicker, the title and
 * whatever supporting lines it is handed. It fetches and formats nothing.
 *
 * The wash is always painted under the picture, so a missing or failed image
 * needs no error state here: the caller simply stops passing `image`, and the
 * design's journal plate is what remains — a soft wash, not an error message.
 */
function BlogPostCardView({
  title,
  category,
  excerpt,
  dateTime,
  dateLabel,
  image,
  washSeed = 0,
  compact = false,
  asChild = false,
  className,
  children,
  ...props
}: BlogPostCardViewProps) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="blog-post-card"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    >
      {/* With `asChild`, this is the link element the rest renders inside. */}
      <Slottable>{children}</Slottable>

      <div
        className={cn(
          "organic-washed relative aspect-[16/10] overflow-hidden",
          washFor(washSeed)
        )}
      >
        {image}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col px-6 pb-[1.625rem] pt-1.5",
          compact && "px-[1.375rem] pb-6 pt-1"
        )}
      >
        {/* The kicker: the collection this entry belongs to, in the accent, at
            the smallest step the system sets. Not a filled tag — a tag on a
            card that is already a filled plate reads as a second surface. */}
        {category ? (
          <p className="store-dynamic-text mb-2 line-clamp-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-rose [.locale-fa_&]:tracking-normal [.locale-fa_&]:normal-case">
            <DynamicText>{category}</DynamicText>
          </p>
        ) : null}

        <h3
          className={cn(
            "store-dynamic-text font-display line-clamp-3 leading-[1.2] text-card-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-[1.6]",
            compact ? "text-[1.1875rem]" : "text-xl"
          )}
        >
          <DynamicText>{title}</DynamicText>
        </h3>

        {excerpt ? (
          <p className="store-lede mt-2 line-clamp-2 text-[0.84375rem] text-card-foreground/70">
            {excerpt}
          </p>
        ) : null}

        {dateLabel ? (
          <p className="mt-auto pt-4 text-xs text-muted-foreground">
            <time dateTime={dateTime ?? undefined}>{dateLabel}</time>
          </p>
        ) : null}
      </div>
    </Comp>
  )
}

export { BlogPostCardView }
