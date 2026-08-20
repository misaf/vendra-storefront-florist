import { ImageOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * What fills a product's image frame when the file itself fails to load — a
 * different situation from a product that simply has no image, which gets the
 * drawn placeholder via `ThemedProductImage`.
 *
 * The card and the detail page each had their own copy at different icon sizes,
 * so the same failure looked like two different states depending on where the
 * customer met it. `size` scales the mark to the frame instead.
 */
export function ProductImageFallback({
  label,
  size = "sm",
  className,
}: {
  label: string;
  /** `sm` for a card-sized frame, `lg` for a detail-page frame. */
  size?: "sm" | "lg";
  className?: string;
}) {
  const isLarge = size === "lg";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center bg-card text-muted-foreground",
        isLarge ? "gap-3" : "gap-2",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-background/75 shadow-sm ring-1 ring-border",
          isLarge ? "size-16" : "size-11"
        )}
      >
        <ImageOff className={isLarge ? "size-7" : "size-5"} aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-center font-semibold",
          isLarge ? "text-sm" : "max-w-28 text-xs leading-4"
        )}
      >
        {label}
      </span>
    </div>
  );
}
