"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, ChevronDown, Menu, Phone } from "lucide-react"

import { DynamicText } from "@/shared/components/dynamic-text"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

/** A link target: a path, or a router object when `linkAs` is a router link. */
type HeaderHref = string | { pathname: string; query?: Record<string, string> }

interface HeaderNavLink {
  key: string
  href: HeaderHref
  label: string
  active?: boolean
}

/** A bar entry: a link, or a ready-made control (the shop's category menu). */
type HeaderNavItem = HeaderNavLink | { key: string; element: React.ReactNode }

/** A drawer row. Give it `categories` to hang a disclosure off it. */
interface HeaderDrawerItem extends HeaderNavLink {
  categories?: { key: string; href: HeaderHref; label: string }[]
  /** Shown in place of an empty category list: loading, or none. */
  categoriesNote?: string
}

interface HeaderLabels {
  utilities: string
  mainNavigation: string
  callStore: string
  close: string
  mobileNavigationDescription: string
  browseByCategory: string
}

const DEFAULT_LABELS: HeaderLabels = {
  utilities: "Store utilities",
  mainNavigation: "Main navigation",
  callStore: "Call the store",
  close: "Close",
  mobileNavigationDescription: "Browse the shop and its pages.",
  browseByCategory: "Browse by category",
}

interface HeaderViewProps {
  storeName: string
  tagline?: string
  /** The drawer's shorter line under the name. */
  mobileTagline?: string
  /** The brand glyph, drawn at two sizes. */
  brandIcon: React.ComponentType<{ className?: string }>
  homeHref?: HeaderHref
  /** The element every internal link renders as, e.g. a router `Link`. */
  linkAs?: React.ElementType
  /** Applied to the bar, the header and the drawer (which portals out). */
  localeClassName?: string
  /** Arrows point the reading direction. */
  rtl?: boolean
  /** The standing promises in the utility bar, joined by a dot. */
  promises?: string[]
  phone?: { href: string; label: string }
  /** Language and theme controls, sized for the utility bar. */
  utilityControls?: React.ReactNode
  showNav?: boolean
  /** The desktop bar, in order. */
  navItems?: HeaderNavItem[]
  /** Search and cart, and whatever else sits at the row's end. */
  actions?: React.ReactNode
  /** The account control: in the bar from `sm`, in the drawer's foot below. */
  account?: React.ReactNode
  /** Every destination, for the drawer, in the bar's order. */
  drawerItems?: HeaderDrawerItem[]
  /** The full-width search at the top of the drawer. */
  drawerSearch?: React.ReactNode
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  categoriesExpanded?: boolean
  onCategoriesExpandedChange?: (expanded: boolean) => void
  labels?: Partial<HeaderLabels>
}

function isLink(item: HeaderNavItem): item is HeaderNavLink {
  return "href" in item
}

/**
 * The storefront's chrome: a utility bar that scrolls away, then the pinned
 * navigation bar with the brand, one level of links and the shop's actions,
 * and on small screens a drawer holding every destination.
 *
 * This is the drawn half. It fetches nothing and knows no routes; the app's
 * `Header` decides which link is active, fills the category list, and passes
 * its search, cart, account, language and theme controls in as slots.
 */
function HeaderView({
  storeName,
  tagline,
  mobileTagline,
  brandIcon: BrandIcon,
  homeHref = "/",
  linkAs: LinkAs = "a",
  localeClassName,
  rtl = false,
  promises = [],
  phone,
  utilityControls,
  showNav = true,
  navItems = [],
  actions,
  account,
  drawerItems = [],
  drawerSearch,
  mobileOpen,
  onMobileOpenChange,
  categoriesExpanded,
  onCategoriesExpandedChange,
  labels,
}: HeaderViewProps) {
  const text = { ...DEFAULT_LABELS, ...labels }
  const ArrowIcon = rtl ? ArrowLeft : ArrowRight

  // Uncontrolled fallbacks, so the view also works on its own in a preview.
  const [ownOpen, setOwnOpen] = React.useState(false)
  const open = mobileOpen ?? ownOpen
  const setOpen = onMobileOpenChange ?? setOwnOpen
  const disclosureItem = drawerItems.find((item) => item.categories)
  const [ownExpanded, setOwnExpanded] = React.useState<boolean | null>(null)
  const expanded = categoriesExpanded ?? ownExpanded ?? Boolean(disclosureItem?.active)
  const setExpanded = onCategoriesExpandedChange ?? setOwnExpanded

  return (
    <>
      {/* Utility bar — secondary controls and the standing promise live here so
          the main bar can hold one clear level of navigation. It scrolls away
          with the page; only the navigation bar below stays pinned, which keeps
          the sticky chrome short on small screens. A labelled region, not a
          bare div: content outside every landmark is content a screen-reader
          user can skip past without ever being offered it. */}
      <div
        role="region"
        aria-label={text.utilities}
        data-slot="header-utilities"
        className={cn("bg-clay-800 text-clay-100", localeClassName)}
      >
        <div className="store-container flex min-h-9 flex-wrap items-center justify-center gap-x-4 gap-y-0.5 py-1 text-xs sm:justify-between">
          <p className="text-center leading-normal text-clay-100/82">
            {promises.map((promise, index) => (
              <React.Fragment key={promise}>
                {index > 0 ? (
                  <span className="mx-2 text-clay-100/40" aria-hidden="true">•</span>
                ) : null}
                {promise}
              </React.Fragment>
            ))}
          </p>
          {/* The bar's controls are pills of the surface itself: transparent at
              rest, lifting to a 12% white wash on hover. The negative block
              margin keeps every fingertip target while the strip stays the thin
              band the design draws. */}
          <div className="flex items-center gap-1 [&_button]:-my-1 [&_button]:min-w-0 [&_button]:px-2.5 [&_button]:text-clay-100/86 [&_button:hover]:bg-white/12 [&_button:hover]:text-clay-100 [&_svg]:size-[0.9375rem]">
            {phone ? (
              <a
                href={phone.href}
                dir="ltr"
                className="store-focus-invert hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-clay-100/86 transition-colors hover:bg-white/12 hover:text-clay-100 sm:inline-flex"
              >
                <Phone className="size-[0.8125rem]" aria-hidden="true" />
                <span className="sr-only">{text.callStore}</span>
                {phone.label}
              </a>
            ) : null}
            {utilityControls}
          </div>
        </div>
      </div>

      <header
        data-slot="header"
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-xl",
          localeClassName
        )}
      >
        <div className="store-container flex h-16 items-center gap-[clamp(0.625rem,1.6vw,1.125rem)] lg:h-[4.5rem]">
          <LinkAs
            href={homeHref}
            className="group flex min-w-0 shrink-0 items-center gap-[0.6875rem] rounded-sm"
          >
            <span className="organic-mark flex size-9 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
              <BrandIcon className="size-[1.1875rem]" />
            </span>
            <span className="min-w-0">
              <span className="font-display line-clamp-2 block text-lg leading-[1.08] text-foreground sm:line-clamp-1 sm:text-xl">
                {storeName}
              </span>
              {tagline ? (
                <span className="mt-0.5 hidden truncate text-[0.71875rem] leading-normal text-foreground/60 md:block">
                  {tagline}
                </span>
              ) : null}
            </span>
          </LinkAs>

          {showNav ? (
            <nav
              className="relative ms-auto hidden flex-1 items-center justify-end gap-x-[clamp(0.5625rem,1.2vw,0.875rem)] gap-y-1 lg:flex"
              aria-label={text.mainNavigation}
            >
              {navItems.map((item) =>
                isLink(item) ? (
                  <LinkAs
                    key={item.key}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    data-active={Boolean(item.active)}
                    className="store-nav-link"
                  >
                    {item.label}
                  </LinkAs>
                ) : (
                  <React.Fragment key={item.key}>{item.element}</React.Fragment>
                )
              )}
            </nav>
          ) : null}

          {/* min-w-0 so the cluster may shrink rather than force the row wider
              than the viewport when text is scaled up. */}
          <div className="ms-auto flex min-w-0 shrink-0 items-center gap-2 lg:ms-2">
            {actions}
            {showNav && account ? <span className="hidden sm:inline-flex">{account}</span> : null}
            {showNav ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label={text.mainNavigation}>
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="start"
                  closeLabel={text.close}
                  className={cn("w-[92vw] max-w-md gap-0 border-border bg-background p-0", localeClassName)}
                >
                  <SheetHeader className="border-b border-border px-5 pb-5 pt-6 text-start">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-b-xl rounded-t-full bg-primary text-primary-foreground">
                        <BrandIcon className="size-5" />
                      </span>
                      <div>
                        <SheetTitle className="font-display text-xl">{storeName}</SheetTitle>
                        {mobileTagline ? (
                          <p className="mt-1 text-xs text-muted-foreground">{mobileTagline}</p>
                        ) : null}
                      </div>
                    </div>
                    <SheetDescription className="sr-only">{text.mobileNavigationDescription}</SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    {drawerSearch ? (
                      <div className="mb-6 border-y border-border py-2">{drawerSearch}</div>
                    ) : null}
                    <nav className="space-y-1" aria-label={text.mainNavigation}>
                      {drawerItems.map((item) => {
                        const rowClass = cn(
                          "flex min-h-12 items-center justify-between rounded-sm border-s-2 px-4 text-base font-semibold transition-colors",
                          item.active
                            ? "border-rose bg-secondary/65 text-foreground"
                            : "border-transparent text-foreground hover:border-border hover:bg-secondary/45"
                        )

                        if (!item.categories) {
                          return (
                            <SheetClose asChild key={item.key}>
                              <LinkAs
                                href={item.href}
                                aria-current={item.active ? "page" : undefined}
                                className={rowClass}
                              >
                                {item.label}
                                <ArrowIcon className="size-4 opacity-55" />
                              </LinkAs>
                            </SheetClose>
                          )
                        }

                        // A row with a second level stays a link, and its
                        // categories hang off a separate control beside it, so
                        // neither destination is taken away from the other. No
                        // trailing arrow here: the chevron already says where
                        // the row leads next.
                        const listId = `drawer-categories-${item.key}`
                        return (
                          <div key={item.key}>
                            <div className="flex items-center gap-1">
                              <SheetClose asChild>
                                <LinkAs
                                  href={item.href}
                                  aria-current={item.active ? "page" : undefined}
                                  className={cn(rowClass, "flex-1")}
                                >
                                  {item.label}
                                </LinkAs>
                              </SheetClose>
                              <button
                                type="button"
                                aria-expanded={expanded}
                                aria-controls={listId}
                                aria-label={text.browseByCategory}
                                onClick={() => setExpanded(!expanded)}
                                className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-secondary"
                              >
                                <ChevronDown
                                  aria-hidden="true"
                                  className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
                                />
                              </button>
                            </div>
                            {expanded ? (
                              item.categories.length === 0 ? (
                                /* An empty disclosure reads as "this shop has no
                                   categories". Say which of the two it is. */
                                <p
                                  id={listId}
                                  className="mt-1 border-s border-border px-4 py-3 text-sm text-muted-foreground"
                                >
                                  {item.categoriesNote}
                                </p>
                              ) : (
                                <ul id={listId} className="mt-1 space-y-0.5 border-s border-border ps-3">
                                  {item.categories.map((category) => (
                                    <li key={category.key}>
                                      <SheetClose asChild>
                                        <LinkAs
                                          href={category.href}
                                          className="store-dynamic-text flex min-h-11 items-center rounded-sm px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                        >
                                          <DynamicText>{category.label}</DynamicText>
                                        </LinkAs>
                                      </SheetClose>
                                    </li>
                                  ))}
                                </ul>
                              )
                            ) : null}
                          </div>
                        )
                      })}
                    </nav>

                    {phone ? (
                      <a
                        href={phone.href}
                        dir="ltr"
                        className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                      >
                        <Phone className="size-4" aria-hidden="true" />
                        <span className="sr-only">{text.callStore}</span>
                        {phone.label}
                      </a>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                    {account ? <span className="sm:hidden">{account}</span> : null}
                    <div className="ms-auto flex items-center gap-1">{utilityControls}</div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>
      </header>
    </>
  )
}

export {
  HeaderView,
  type HeaderDrawerItem,
  type HeaderHref,
  type HeaderLabels,
  type HeaderNavItem,
  type HeaderNavLink,
}
