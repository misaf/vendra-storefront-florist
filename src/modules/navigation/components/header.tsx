"use client";

import { useState } from "react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { CartButton } from "@/modules/cart";
import { UserButton } from "@/modules/account";
import { CategoryMenu, useProductCategories } from "@/modules/products";
import { LanguageSwitcher } from "./language-switcher";
import { GlobalSearch } from "./global-search";
import { HeaderView } from "@/shared/components/ui/header-view";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontName } from "@/shared/config/storefront-context";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { telHref } from "@/shared/lib/utils";
import { toLocaleDigits } from "@/shared/lib/hours";
import { isRtlLocale } from "@/shared/lib/locale";
import { useBrandIcon } from "@/shared/config/storefront-context";

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

/**
 * The storefront's chrome. The drawing is `HeaderView`, in the shared kit; this
 * wrapper decides which link is active, fetches the categories, holds the
 * drawer's state and passes in the controls that need the app (search, cart,
 * account, language, theme and the shop's category menu).
 */
export function Header({ showNav = true }: HeaderProps) {
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  const storeName = useStorefrontName();
  const storefront = useStorefrontConfig();
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
  const localeClass = locale === "fa" ? "locale-fa" : "locale-en";
  const phone = storefront.contact.mobilePhone;
  /* Every destination, for the drawer — a phone has room for the whole site
     and no footer within reach while the drawer is open. */
  const links = [
    { href: "/", label: t("common.home") },
    { href: "/collections", label: t("collections.viewAll") },
    { href: "/about", label: t("common.about") },
    { href: "/blog", label: t("blog.title") },
    { href: "/faq", label: t("common.faq") },
    { href: "/contact", label: t("common.contact") },
  ];

  /* The bar itself carries four: home, the catalogue, the journal and the way
     to reach a person. The design deliberately keeps it that short — About and
     the FAQ are reference pages a shopper goes looking for, and the footer's
     Studio and Help columns are where they are looked for. Six links plus a
     disclosure crowded the row enough that the bar wrapped to two lines on an
     ordinary laptop. */
  const barLinks = [
    { href: "/blog" as const, label: t("blog.title") },
    { href: "/contact" as const, label: t("common.contact") },
  ];

  return (
    <HeaderView
      linkAs={Link}
      storeName={storeName}
      tagline={t("common.storeTagline")}
      mobileTagline={t("common.mobileStoreTagline")}
      brandIcon={BrandIcon}
      localeClassName={localeClass}
      rtl={isRtlLocale(locale)}
      promises={[t("home.heroQuality"), t("home.heroDelivery")]}
      phone={{ href: telHref(phone), label: toLocaleDigits(phone, locale) }}
      utilityControls={
        <>
          <LanguageSwitcher />
          <ThemeToggle />
        </>
      }
      showNav={showNav}
      navItems={[
        { key: "home", href: "/", label: t("common.home"), active: isPathActive(pathname, "/") },
        /* The catalogue disclosure wears the same link as the ones it sits
           between, so the shop reads as one of them rather than as a control
           of a different kind. */
        { key: "shop", element: <CategoryMenu active={isProductsActive} /> },
        ...barLinks.map((item) => ({
          key: item.href,
          href: item.href,
          label: item.label,
          active: isPathActive(pathname, item.href),
        })),
      ]}
      actions={
        <>
          <GlobalSearch />
          <CartButton />
        </>
      }
      account={<UserButton />}
      drawerSearch={<GlobalSearch full />}
      /* Same order as the desktop bar: Home, Products, then the rest — a
         drawer that reorders the site is a second mental model to learn. */
      drawerItems={[
        links[0],
        {
          href: "/products",
          label: t("common.products"),
          categories: categories.map((category) => ({
            key: String(category.id),
            href: { pathname: "/products", query: { category: category.slug } },
            label: category.name,
          })),
          categoriesNote: categoriesLoading ? t("common.loading") : t("common.noCategories"),
        },
        ...links.slice(1),
      ].map((item) => ({ ...item, key: item.href, active: isPathActive(pathname, item.href) }))}
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      categoriesExpanded={mobileCategoriesOpen}
      onCategoriesExpandedChange={setCategoriesExpanded}
      labels={{
        utilities: t("common.storeUtilities"),
        mainNavigation: t("common.mainNavigation"),
        callStore: t("common.callStore"),
        close: t("common.close"),
        mobileNavigationDescription: t("common.mobileNavigationDescription"),
        browseByCategory: t("common.browseByCategory"),
      }}
    />
  );
}
