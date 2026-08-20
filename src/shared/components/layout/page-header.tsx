import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Lede paragraph under the title. */
  description?: ReactNode;
  /** Trail rendered above the eyebrow — pass a <Breadcrumbs />. */
  breadcrumbs?: ReactNode;
  /**
   * Sits beside the title block from `lg` up and stacks under it below that.
   * For a search form or a page-level action, not for body content.
   */
  aside?: ReactNode;
  /** Rendered under the title block, inside the same band. */
  children?: ReactNode;
  className?: string;
}

/**
 * A page's opening band: eyebrow, `<h1>`, lede.
 *
 * Six pages each wrote this by hand and none of them agreed — the gap under the
 * eyebrow was `mb-3` or `mb-4` or a `mt-3` on the title, and the lede came in
 * three sizes (`text-sm sm:text-base`, `text-base sm:text-lg`, `text-lg`). The
 * band's own padding is asymmetric on purpose: tighter at the top, where it
 * meets the sticky bar, than at the bottom, where it hands off to content.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  aside,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("store-container store-section-head", className)}>
      {breadcrumbs ? <div className="mb-4">{breadcrumbs}</div> : null}

      <div
        className={cn(
          aside &&
            "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        )}
      >
        <div className="min-w-0 max-w-2xl">
          {eyebrow ? <p className="store-eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="store-page-title text-foreground">{title}</h1>
          {description ? (
            <p className="store-lede mt-4 text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>

        {aside ? <div className="w-full lg:max-w-md">{aside}</div> : null}
      </div>

      {children}
    </div>
  );
}
