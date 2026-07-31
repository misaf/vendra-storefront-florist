"use client";

import { Suspense, useState } from "react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { CartButton } from "@/modules/cart";
import { UserButton } from "@/modules/account";
import { CategoryMenu } from "@/modules/products";
import { CategoryMediaImage } from "@/modules/products";
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
import { useProductCategories } from "@/modules/products";
import { cn } from "@/shared/lib/utils";
import { isRtlLocale } from "@/shared/lib/locale";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Flower2,
  HelpCircle,
  Home,
  Menu,
  Phone,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HeaderProps {
  showNav?: boolean;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  mobile?: boolean;
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

function isPathActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  return targetPath === "/"
    ? currentPath === targetPath
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function NavLink({
  href,
  children,
  isActive,
  icon: Icon,
  onClick,
  mobile = false,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative rounded-full font-semibold transition-all",
        mobile
          ? "flex w-full items-center gap-3 px-3 py-3 text-base"
          : "inline-flex h-10 items-center px-3.5 text-sm",
        isActive
          ? cn(
              "bg-primary text-primary-foreground shadow-sm",
              mobile ? "shadow-storefront-brand/15" : "shadow-storefront-brand/10"
            )
          : mobile
            ? "text-muted-foreground hover:bg-muted hover:text-primary"
            : "text-primary/80 hover:bg-muted hover:text-primary"
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "size-4 shrink-0",
            !mobile && "hidden",
            isActive
              ? "text-current"
              : "text-muted-foreground transition-colors group-hover:text-primary"
          )}
        />
      ) : null}
      {children}
    </Link>
  );
}

export function Header({ showNav = true }: HeaderProps) {
  const { t, locale } = useTranslations();
  const storeName = usePropertyName();
  const pathname = usePathname();
  const { data: apiCategories = [] } = useProductCategories();
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const localeClass = locale === "fa" ? "locale-fa" : "locale-en";
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const mobileNavDescription = t("common.mobileNavigationDescription");

  const homeHref = "/";
  const productsHref = "/products";
  const faqHref = "/faq";
  const contactHref = "/contact";
  const mobileSecondaryNavLinks = [
    { href: faqHref, label: t("common.faq"), icon: HelpCircle },
    { href: contactHref, label: t("common.contact"), icon: Phone },
  ];
  const featuredMobileCategories = apiCategories.slice(0, 3);
  const regularMobileCategories = apiCategories.slice(3);
  const mobileProductsSubmenuId = "mobile-products-submenu";
  const isProductsActive = isPathActive(pathname, productsHref);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 -mb-24 px-3 py-4",
        localeClass
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative flex h-16 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/85 px-3 shadow-lg shadow-foreground/[0.06] backdrop-blur-xl dark:border-white/12 dark:bg-card/75 dark:shadow-black/25 sm:px-4">
          {/* a quiet underseam running beneath the bar */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
          />
          <Link
            href={homeHref}
            className="group flex min-w-0 items-center gap-3 rounded-full py-1.5 pe-2 ps-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-foreground/20 ring-2 ring-border transition-transform group-hover:-translate-y-0.5">
              <Flower2 className="size-5" />
            </span>
            <div className="min-w-0 leading-none">
              <span className="font-display block truncate text-lg font-medium text-foreground dark:text-white sm:text-xl">
                {storeName}
              </span>
              <span className="mt-1 hidden font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
                {t("common.storeTagline")}
              </span>
            </div>
          </Link>
          {showNav && (
            <nav
              className={cn(
                "hidden items-center gap-1 lg:flex",
                localeClass
              )}
              aria-label={t("common.mainNavigation")}
            >
              <NavLink href={homeHref} isActive={isPathActive(pathname, homeHref)} icon={Home}>
                {t("common.home")}
              </NavLink>
              <Suspense fallback={null}>
                <CategoryMenu />
              </Suspense>
              <NavLink href={faqHref} isActive={isPathActive(pathname, faqHref)} icon={HelpCircle}>
                {t("common.faq")}
              </NavLink>
              <NavLink
                href={contactHref}
                isActive={isPathActive(pathname, contactHref)}
                icon={Phone}
              >
                {t("common.contact")}
              </NavLink>
            </nav>
          )}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <GlobalSearch />
            <div className="hidden items-center gap-0.5 sm:flex">
              <ThemeToggle />
              <LanguageSwitcher />
              {showNav && <UserButton />}
              <CartButton />
            </div>
            {showNav && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-primary hover:bg-muted hover:text-primary dark:text-white dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
                    aria-label={t("common.categories")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={isRTL ? "right" : "left"}
                  className={cn(
                    "w-[88vw] max-w-sm overflow-y-auto border-border bg-[linear-gradient(160deg,var(--background),var(--storefront-brand-soft)_58%,var(--background))] p-0 text-foreground dark:bg-[linear-gradient(160deg,var(--background),var(--storefront-brand-soft)_58%,var(--background))]",
                    localeClass
                  )}
                >
                  <SheetHeader className="border-b border-border bg-card/38 p-5 text-start dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Flower2 className="size-5" />
                      </span>
                      <div>
                        <SheetTitle>{storeName}</SheetTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("common.mobileStoreTagline")}
                        </p>
                      </div>
                    </div>
                    <SheetDescription className="sr-only">
                      {mobileNavDescription}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-5 p-4">
                    <div className="rounded-full border border-border bg-card/70 p-1 shadow-sm shadow-storefront-brand/[0.04] dark:bg-white/8">
                      <GlobalSearch />
                    </div>

                    <SheetClose asChild>
                      <Button asChild className="justify-between rounded-full">
                        <Link href={productsHref}>
                          {t("common.shopNow")}
                          <ArrowIcon className="size-4" />
                        </Link>
                      </Button>
                    </SheetClose>

                    <div className="grid gap-1">
                      <SheetClose asChild>
                        <NavLink
                          href={homeHref}
                          isActive={isPathActive(pathname, homeHref)}
                          icon={Home}
                          mobile
                        >
                          {t("common.home")}
                        </NavLink>
                      </SheetClose>

                      <button
                        type="button"
                        aria-expanded={isMobileProductsOpen}
                        aria-controls={mobileProductsSubmenuId}
                        onClick={() =>
                          setIsMobileProductsOpen((isOpen) => !isOpen)
                        }
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-full px-3 py-3 text-start text-base font-semibold transition-all",
                          isProductsActive
                            ? "bg-primary text-primary-foreground shadow-sm shadow-storefront-brand/15"
                            : "text-muted-foreground hover:bg-muted hover:text-primary"
                        )}
                      >
                        <ShoppingBag
                          className={cn(
                            "size-4 shrink-0",
                            isProductsActive
                              ? "text-current"
                              : "text-muted-foreground transition-colors group-hover:text-primary"
                          )}
                        />
                        <span className="flex-1">{t("common.products")}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 transition-transform",
                            isMobileProductsOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isMobileProductsOpen ? (
                        <div
                          id={mobileProductsSubmenuId}
                          className="mt-2 grid gap-2 rounded-lg border border-border bg-card/50 p-2 dark:bg-white/8"
                        >
                          <SheetClose asChild>
                            <Link
                              href={productsHref}
                              className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-muted dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                            >
                              {t("common.viewAllProducts")}
                              <ArrowIcon className="size-4 shrink-0 text-muted-foreground" />
                            </Link>
                          </SheetClose>

                          {apiCategories.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-muted-foreground">
                              {t("common.noCategories")}
                            </p>
                          ) : null}

                          {featuredMobileCategories.map((category) => (
                            <SheetClose key={category.id} asChild>
                              <Link
                                href={{
                                  pathname: productsHref,
                                  query: { category: category.slug },
                                }}
                                className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card/75 p-2 text-sm text-card-foreground transition hover:border-primary/20 hover:bg-muted dark:bg-white/8 dark:hover:bg-white/12"
                              >
                                <CategoryMediaImage
                                  src={category.image}
                                  alt={category.name}
                                  className="block aspect-[4/3] rounded-md bg-storefront-brand/5 dark:bg-white/10"
                                  imageClassName="transition-transform group-hover:scale-105"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate font-semibold">
                                    {category.name}
                                  </span>
                                  {category.description ? (
                                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                                      {category.description}
                                    </span>
                                  ) : null}
                                </span>
                                <ArrowIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                              </Link>
                            </SheetClose>
                          ))}

                          {regularMobileCategories.map((category) => (
                            <SheetClose key={category.id} asChild>
                              <Link
                                href={{
                                  pathname: productsHref,
                                  query: { category: category.slug },
                                }}
                                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card/75 p-3 text-sm font-semibold text-card-foreground transition hover:border-primary/20 hover:bg-muted dark:bg-white/8 dark:hover:bg-white/12"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate">
                                    {category.name}
                                  </span>
                                  {category.description ? (
                                    <span className="mt-0.5 line-clamp-1 block text-xs font-normal text-muted-foreground">
                                      {category.description}
                                    </span>
                                  ) : null}
                                </span>
                                <ArrowIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      ) : null}

                      {mobileSecondaryNavLinks.map((item) => (
                        <SheetClose key={item.href} asChild>
                          <NavLink
                            href={item.href}
                            isActive={isPathActive(pathname, item.href)}
                            icon={item.icon}
                            mobile
                          >
                            {item.label}
                          </NavLink>
                        </SheetClose>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:hidden">
                      <ThemeToggle />
                      <LanguageSwitcher />
                      <UserButton />
                      <CartButton />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="sm:hidden">
              <CartButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
