import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** A "view all" link or similar, aligned to the end of the row. */
  action?: ReactNode;
  /**
   * Heading level for the section's title. Sections nested inside another
   * section's content need `h3` so the document outline stays walkable.
   */
  as?: "h2" | "h3";
  /** Inverts the copy for the ink-coloured brand bands. */
  tone?: "default" | "inverted";
  className?: string;
}

/**
 * The header of a content section: eyebrow, heading, optional lede and one
 * end-aligned action. Companion to `PageHeader`, which opens a page.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  tone = "default",
  className,
}: SectionHeaderProps) {
  const inverted = tone === "inverted";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-5",
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p
            className={cn(
              "store-eyebrow mb-3",
              inverted && "text-storefront-brand-foreground/70"
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading
          className={cn(
            "store-section-title",
            inverted ? "text-storefront-brand-foreground" : "text-foreground"
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              "store-lede mt-3 text-sm sm:text-base",
              inverted
                ? "text-storefront-brand-foreground/75"
                : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
