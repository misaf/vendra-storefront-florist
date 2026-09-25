import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"

import { DynamicText } from "@/shared/components/dynamic-text"
import { cn } from "@/shared/lib/utils"
import { CategoryImageFallback } from "./category-image-fallback"

interface CategoryTileViewProps
  extends Omit<React.ComponentProps<"a">, "children"> {
  name: string
  description?: string | null
  /** The photograph, already sized by the caller. Omit to draw the fallback. */
  image?: React.ReactNode
  /** Tailwind aspect utility for the image frame, e.g. `aspect-[5/4]`. */
  aspect?: string
  /** Varies the drawn fallback's wash; the tile's index is the natural value. */
  tone?: number
  /** Feature tiles caption themselves with the catalogue's own description. */
  showDescription?: boolean
  /** An editorial arch for image-led home-page collection cards. */
  shape?: "soft" | "arch"
  /** Render through the child element instead, e.g. a router `<Link />`. */
  asChild?: boolean
  children?: React.ReactElement
}

/**
 * The drawn half of the storefront's category tile: the plate, and the name
 * under it. It fetches nothing and knows no routes, so the design system can
 * render it as-is; the app's `CategoryTile` supplies the photograph and the
 * link. See that component for why the name sits under the picture, not on it.
 */
function CategoryTileView({
  name,
  description,
  image,
  aspect = "aspect-[5/4]",
  tone = 0,
  showDescription = false,
  shape = "soft",
  asChild = false,
  className,
  children,
  ...props
}: CategoryTileViewProps) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="category-tile"
      className={cn(
        "group flex h-full flex-col rounded-[1.75rem] outline-offset-4",
        className
      )}
      {...props}
    >
      {/* With `asChild`, this is the link element the rest renders inside. */}
      <Slottable>{children}</Slottable>

      {/* Fixed aspect on a `fill` image reserves the row before media arrives. */}
      <div
        className={cn(
          "organic-washed relative w-full overflow-hidden bg-secondary shadow-card transition-shadow duration-300 group-hover:shadow-panel",
          aspect,
          shape === "arch" ? "organic-arch" : "rounded-[1.75rem]"
        )}
      >
        {image ?? <CategoryImageFallback tone={tone} />}
      </div>

      {/* Name and caption on the page's own ground, under the plate — the
          design sets no arrow and no chip here. The picture is the affordance,
          and the whole tile is the link. */}
      <div className="flex flex-1 flex-col">
        <h3
          className={cn(
            "store-dynamic-text font-display leading-tight text-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-normal",
            showDescription
              ? "mt-[1.125rem] text-xl sm:text-[1.375rem]"
              : "mt-3.5 text-base sm:text-lg"
          )}
        >
          <DynamicText>{name}</DynamicText>
        </h3>
        {showDescription && description ? (
          <p className="store-lede mt-1 line-clamp-2 text-[0.84375rem] text-foreground/65">
            <DynamicText>{description}</DynamicText>
          </p>
        ) : null}
      </div>
    </Comp>
  )
}

export { CategoryTileView }
