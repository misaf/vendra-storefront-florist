import * as React from "react"

import { DynamicText } from "@/shared/components/dynamic-text"
import { cn } from "@/shared/lib/utils"

/** A link target: a path, or a router object when `linkAs` is a router link. */
type FooterHref = string | { pathname: string; query?: Record<string, string> }

interface FooterLink {
  key: string
  href: FooterHref
  label: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

interface FooterSocial {
  label: string
  href: string
  icon: React.ReactNode
}

interface FooterViewProps extends Omit<React.ComponentProps<"footer">, "children"> {
  storeName: string
  tagline?: string
  /** The phone as dialled (`tel:` href) and as shown (locale digits). */
  phone?: { href: string; label: string }
  /** Screen-reader word before the phone number. */
  callLabel?: string
  /** Where and when: one row each, a glyph in a fixed gutter beside the value. */
  details?: { glyph: string; value: string }[]
  email?: string | null
  socials?: FooterSocial[]
  columns: FooterColumn[]
  navLabel?: string
  copyright: string
  /** The closing line opposite the copyright — where the shop is. */
  madeIn?: string | null
  homeHref?: FooterHref
  /** The element every internal link renders as, e.g. a router `Link`. */
  linkAs?: React.ElementType
}

const footerLink =
  "store-focus-invert -my-1.5 inline-flex min-h-11 items-start rounded-sm py-1.5 text-start text-sm text-white/75 transition-colors hover:text-white"

/**
 * The ink foot of every page, in the design system's two-part composition: the
 * shop on one side, the site's map on the other.
 *
 * The left column is the shop as a person would give it — mark, name, a line
 * about what it is, then the phone set large enough to dial from across the
 * room, then where and when, then the accounts it answers on. The right column
 * is link lists on their own measure. Every row is optional: a shop that has
 * not configured one simply does not draw it.
 *
 * This is the drawn half; the app's `Footer` supplies the store's settings,
 * translations and categories.
 */
function FooterView({
  storeName,
  tagline,
  phone,
  callLabel = "Call the store",
  details = [],
  email,
  socials = [],
  columns,
  navLabel = "Footer",
  copyright,
  madeIn,
  homeHref = "/",
  linkAs: LinkAs = "a",
  className,
  ...props
}: FooterViewProps) {
  return (
    <footer
      data-slot="footer"
      className={cn("bg-storefront-brand text-storefront-brand-foreground", className)}
      {...props}
    >
      <div className="store-container grid gap-8 pb-10 pt-14 sm:pt-[clamp(3.375rem,7vw,5.625rem)] lg:grid-cols-[minmax(17rem,0.85fr)_minmax(18.75rem,2fr)] lg:gap-[clamp(2rem,4vw,3.25rem)]">
        <div>
          <LinkAs
            href={homeHref}
            className="store-focus-invert inline-flex items-center gap-[0.6875rem] rounded-sm"
          >
            {/* Decorative, and deliberately empty: the design's footer mark is
                the petal itself rather than a second glyph holder. */}
            <span className="organic-mark-petal size-[1.875rem] shrink-0" aria-hidden="true" />
            <span className="font-display text-[1.1875rem] leading-tight text-white">
              {storeName}
            </span>
          </LinkAs>

          {tagline ? (
            <p className="mt-4 max-w-[32ch] text-sm leading-[1.65] text-white/70">{tagline}</p>
          ) : null}

          {/* The one line in the foot set in the display face: a florist is
              still a shop people ring up. */}
          {phone ? (
            <a
              href={phone.href}
              dir="ltr"
              className="store-focus-invert font-display mt-5 inline-block rounded-sm text-[1.1875rem] text-white transition-colors hover:text-clay-800"
            >
              <span className="sr-only">{callLabel}</span>
              {phone.label}
            </a>
          ) : null}

          {details.length > 0 || email ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {details.map(({ glyph, value }) => (
                <p key={value} className="flex items-start gap-[0.6875rem]">
                  <span
                    aria-hidden="true"
                    className="w-[1.375rem] shrink-0 text-center text-[0.8125rem] leading-6 text-white/55"
                  >
                    {glyph}
                  </span>
                  <span className="text-[0.84375rem] leading-normal text-white/72">{value}</span>
                </p>
              ))}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="store-focus-invert -my-1 flex min-h-11 items-start gap-[0.6875rem] rounded-sm py-1"
                >
                  <span
                    aria-hidden="true"
                    className="w-[1.375rem] shrink-0 text-center text-[0.8125rem] leading-6 text-white/55"
                  >
                    ✉
                  </span>
                  <span className="store-dynamic-text text-[0.84375rem] leading-6 text-white/72 transition-colors hover:text-white">
                    {email}
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div className="mt-6 flex gap-2.5">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="store-focus-invert flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-primary hover:text-primary-foreground [&_svg]:size-[1.0625rem]"
                >
                  {icon}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {/* One `auto-fit` row on a 108px floor, exactly as the design states
            it: three lists on a laptop, two on a tablet, one on a phone —
            without a breakpoint per step, and with a Persian heading wider
            than its English counterpart free to reflow instead of clipping. */}
        <nav
          aria-label={navLabel}
          className="grid content-start gap-[clamp(1.25rem,2.4vw,2.25rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,6.75rem),1fr))]"
        >
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.09em] text-white/60 [.locale-fa_&]:tracking-normal">
                {column.title}
              </h3>
              <ul className="mt-4 flex flex-col items-start">
                {column.links.map((link) => (
                  <li key={link.key} className="max-w-full">
                    <LinkAs href={link.href} className={footerLink}>
                      <span className="store-dynamic-text">
                        <DynamicText>{link.label}</DynamicText>
                      </span>
                    </LinkAs>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* The design closes on two lines pushed to opposite ends: the rights
          notice, and a place — which disappears for a shop that has not set
          one rather than printing an empty half. */}
      <div className="store-container flex flex-wrap justify-between gap-5 border-t border-white/18 pb-10 pt-6 text-[0.78125rem] text-white/60">
        <p>{copyright}</p>
        {madeIn ? <p>{madeIn}</p> : null}
      </div>
    </footer>
  )
}

export { FooterView, type FooterColumn, type FooterHref, type FooterLink, type FooterSocial }
