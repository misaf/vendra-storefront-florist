"use client";

import { useState } from "react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { CartButton } from "@/modules/cart";
import { UserButton } from "@/modules/account";
import { CategoryMenu, useProductCategories } from "@/modules/products";
import { LanguageSwitcher } from "./language-switcher";
import { GlobalSearch } from "./global-search";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { usePropertyName } from "@/shared/property/use-property-name";
import { useProperty } from "@/shared/property/property-provider";
import { cn, telHref } from "@/shared/lib/utils";
import { isRtlLocale } from "@/shared/lib/locale";
import { ArrowLeft, ArrowRight, ChevronDown, Menu, Phone } from "lucide-react";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { DynamicText } from "@/shared/components/dynamic-text";

interface HeaderProps {
  showNav?: boolean;
}

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isPathActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return target === "/" ? current === target : current === target || current.startsWith(`${target}/`);
}

export function Header({ showNav = true }: HeaderProps) {
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  const storeName = usePropertyName();
  const property = useProperty();
  const pathname = usePathname();
  const { data: categories = [], isLoading: categoriesLoading } =
    useProductCategories(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isProductsActive = isPathActive(pathname, "/products");
  // Null until the shopper has an opinion, so the disclosure follows the route
  // — open where the categories are the reason the drawer was opened at all —
  // and only stops following once they have opened or closed it themselves.
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean | null>(null);
  const mobileCategoriesOpen = categoriesExpanded ?? isProductsActive;
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const localeClass = locale === "fa" ? "locale-fa" : "locale-en";
  const phone = property.contact.mobilePhone;
  const links = [
    { href: "/", label: t("common.home") },
    { href: "/about", label: t("common.about") },
    { href: "/blog", label: t("blog.title") },
    { href: "/faq", label: t("common.faq") },
    { href: "/contact", label: t("common.contact") },
  ];

  const navLinkClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-semibold transition-colors",
      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
    );

  return (
    <>
      {/* Utility bar — secondary controls and the standing promise live here so
          the main bar can hold one clear level of navigation. It scrolls away
          with the page; only the navigation bar below stays pinned, which keeps
          the sticky chrome short on small screens. */}
      {/* A labelled region, not a bare div: this bar sits outside <header> so
          that only the navigation below it stays pinned, and content outside
          every landmark is content a screen-reader user can skip past without
          ever being offered it. */}
      <div
        role="region"
        aria-label={t("common.storeUtilities")}
        className={cn("border-b border-border bg-secondary text-secondary-foreground", localeClass)}
      >
        <div className="store-container flex min-h-9 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1.5 text-xs font-medium sm:justify-between">
          <p className="text-center text-secondary-foreground/90">
            {t("home.heroQuality")}
            <span className="mx-2 text-muted-foreground" aria-hidden="true">|</span>
            {t("home.heroDelivery")}
          </p>
          <div className="flex items-center gap-1">
            <a
              href={telHref(phone)}
              dir="ltr"
              className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 font-semibold transition-colors hover:text-primary sm:inline-flex"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{t("common.callStore")}</span>
              {phone}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <header className={cn("sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl", localeClass)}>
        <div className="store-container flex h-16 items-center gap-2 lg:h-[4.5rem] lg:gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 rounded-lg sm:gap-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-6">
              <BrandIcon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="font-display line-clamp-2 block text-sm leading-tight text-foreground sm:line-clamp-1 sm:text-lg xl:text-xl">{storeName}</span>
              <span className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block">{t("common.storeTagline")}</span>
            </span>
          </Link>

          {showNav ? (
            <nav
              className="relative ms-auto hidden items-center gap-0.5 lg:flex"
              aria-label={t("common.mainNavigation")}
            >
              <Link
                href="/"
                aria-current={isPathActive(pathname, "/") ? "page" : undefined}
                className={navLinkClass(isPathActive(pathname, "/"))}
              >
                {t("common.home")}
              </Link>
              {/* The catalogue disclosure wears the same pill as the links it
                  sits between, so Products reads as one of them rather than as
                  a taller control of a different kind. */}
              <CategoryMenu
                className={navLinkClass(isProductsActive)}
                active={isProductsActive}
              />
              {links.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isPathActive(pathname, item.href) ? "page" : undefined}
                  className={navLinkClass(isPathActive(pathname, item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          {/* min-w-0 so the cluster may shrink rather than force the row wider
              than the viewport when text is scaled up. */}
          <div className="ms-auto flex min-w-0 items-center gap-0.5 lg:ms-2">
            <GlobalSearch />
            {showNav ? <span className="hidden sm:inline-flex"><UserButton /></span> : null}
            <CartButton />
            {showNav ? (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("common.mainNavigation")}>
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="start"
                  closeLabel={t("common.close")}
                  className={cn("w-[92vw] max-w-md gap-0 border-border bg-background p-0", localeClass)}
                >
                  <SheetHeader className="border-b border-border px-5 pb-5 pt-6 text-start">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><BrandIcon className="size-5" /></span>
                      <div>
                        <SheetTitle className="font-display text-xl">{storeName}</SheetTitle>
                        <p className="mt-1 text-xs text-muted-foreground">{t("common.mobileStoreTagline")}</p>
                      </div>
                    </div>
                    <SheetDescription className="sr-only">{t("common.mobileNavigationDescription")}</SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    <div className="mb-5 rounded-xl bg-secondary/70 p-1"><GlobalSearch full /></div>
                    <nav className="space-y-1" aria-label={t("common.mainNavigation")}>
                      {/* Same order as the desktop bar: Home, Products, then the
                          rest — a drawer that reorders the site is a second
                          mental model to learn. */}
                      {[links[0], { href: "/products", label: t("common.products") }, ...links.slice(1)].map((item) => {
                        const active = isPathActive(pathname, item.href);
                        const rowClass = cn(
                          "flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-semibold transition-colors",
                          active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                        );

                        if (item.href !== "/products") {
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link href={item.href} aria-current={active ? "page" : undefined} className={rowClass}>
                                {item.label}<ArrowIcon className="size-4 opacity-55" />
                              </Link>
                            </SheetClose>
                          );
                        }

                        // Products carries a second level. The row stays a link
                        // to the catalogue and the categories hang off a
                        // separate control beside it, so neither destination is
                        // taken away from the other — the desktop panel's two
                        // jobs, in the shape a thumb expects.
                        return (
                          <div key={item.href}>
                            <div className="flex items-center gap-1">
                              {/* No trailing arrow on this one row: the chevron
                                  beside it already says where the row leads
                                  next, and two arrows in one row read as one
                                  ambiguous control rather than two clear ones. */}
                              <SheetClose asChild>
                                <Link
                                  href={item.href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(rowClass, "flex-1")}
                                >
                                  {item.label}
                                </Link>
                              </SheetClose>
                              <button
                                type="button"
                                aria-expanded={mobileCategoriesOpen}
                                aria-controls="mobile-product-categories"
                                aria-label={t("common.browseByCategory")}
                                onClick={() => setCategoriesExpanded(!mobileCategoriesOpen)}
                                className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-secondary"
                              >
                                <ChevronDown
                                  aria-hidden="true"
                                  className={cn("size-4 transition-transform duration-200", mobileCategoriesOpen && "rotate-180")}
                                />
                              </button>
                            </div>
                            {mobileCategoriesOpen ? (
                              categories.length === 0 ? (
                                /* An empty disclosure reads as "this shop has
                                   no categories". Say which of the two it is. */
                                <p
                                  id="mobile-product-categories"
                                  className="mt-1 border-s border-border px-4 py-3 text-sm text-muted-foreground"
                                >
                                  {categoriesLoading
                                    ? t("common.loading")
                                    : t("common.noCategories")}
                                </p>
                              ) : (
                              <ul id="mobile-product-categories" className="mt-1 space-y-0.5 border-s border-border ps-3">
                                {categories.map((category) => (
                                  <li key={category.id}>
                                    <SheetClose asChild>
                                      <Link
                                        href={{ pathname: "/products", query: { category: category.slug } }}
                                        className="store-dynamic-text flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                      >
                                        <DynamicText>{category.name}</DynamicText>
                                      </Link>
                                    </SheetClose>
                                  </li>
                                ))}
                              </ul>
                              )
                            ) : null}
                          </div>
                        );
                      })}
                    </nav>

                    <a
                      href={telHref(phone)}
                      dir="ltr"
                      className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <Phone className="size-4" aria-hidden="true" />
                      <span className="sr-only">{t("common.callStore")}</span>
                      {phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                    <span className="sm:hidden"><UserButton /></span>
                    <div className="ms-auto flex items-center gap-1"><LanguageSwitcher /><ThemeToggle /></div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
