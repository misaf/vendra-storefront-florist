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
  className?: string;
}

/**
 * The header of a content section: eyebrow, heading, optional lede and one
 * end-aligned action. Companion to `PageHeader`, which opens a page.
 *
 * It used to carry an `inverted` tone for reversing the copy out of an ink
 * band. No section is set on ink any more — the assurances band, the ordering
 * band and the newsletter panel all sit on the system's warm surfaces — so the
 * variant had no callers and three `cn()` branches maintaining it.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-5",
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="store-eyebrow mb-3">{eyebrow}</p> : null}
        <Heading className="store-section-title text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="store-lede mt-3 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
