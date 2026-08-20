import { Fragment, type ComponentProps } from "react";
import { Link } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item — that one renders as the current page. */
  href?: ComponentProps<typeof Link>["href"];
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark, e.g. t("products.breadcrumb"). */
  label: string;
  className?: string;
}

/**
 * The trail above a page title. Both places that had one wrote out the same
 * link classes per item — four copies in the product detail page alone — and
 * they had already drifted on tap-target height and hover colour.
 *
 * Labels go through `<bdi>` because a Persian category name inside the English
 * layout has to order correctly without dragging the trail to the other edge.
 */
export function Breadcrumbs({ items, label, className }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {/* A separate <li> rather than `display: contents` on a wrapper,
                  which drops the list semantics in some screen readers. */}
              {index > 0 ? <li aria-hidden="true">/</li> : null}
              <li
                aria-current={isLast ? "page" : undefined}
                className={
                  isLast
                    ? "store-dynamic-text line-clamp-1 max-w-full font-semibold text-foreground"
                    : "min-w-0"
                }
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    // The negative margin keeps the 44px target from adding
                    // height to the trail while still giving a fingertip
                    // somewhere to land.
                    className="-my-2 inline-flex min-h-11 items-center rounded-sm py-2 transition-colors hover:text-foreground"
                  >
                    <bdi>{item.label}</bdi>
                  </Link>
                ) : (
                  <bdi>{item.label}</bdi>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
