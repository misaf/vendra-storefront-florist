import type { Metadata } from "next";
import { Cairo, Caprasimo, Figtree, Rakkas } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { getDirection } from "@/shared/lib/locale";
import { Cart } from "@/modules/cart";
import { JsonLd } from "@/shared/components/seo/json-ld";
import { CartProvider } from "@/modules/cart";
import { FavoritesProvider } from "@/modules/account";
import { OrderProvider } from "@/modules/account";
import { routing } from "@/shared/i18n/routing";
import { ApiQueryProvider } from "@/shared/api/query-client";
import { getSiteUrl } from "@/shared/config";
import { getStorefrontConfig } from "@/shared/config/storefront";
import { StorefrontConfigProvider } from "@/shared/config/storefront-context";
import { getRequestTheme } from "@/shared/lib/theme-server";
import {
  SITE_NAME,
  buildMetadata,
  organizationSchema,
  websiteSchema,
} from "@/shared/seo";

// The Organic design system's four faces. Latin gets Figtree for text and
// Caprasimo for display; Persian gets Cairo and Rakkas, so an fa page has the
// same two-texture split a Latin one has rather than the body face at 700
// standing in for a masthead.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  // Only what the storefront actually sets: body, semibold labels, bold
  // eyebrows. Every extra weight is another file on the critical path.
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Both display faces ship a single weight, which is why `.font-display` asks
// for 400 — anything heavier is synthesised and smears the counters shut.
const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const rakkas = Rakkas({
  variable: "--font-rakkas",
  subsets: ["arabic", "latin"],
  weight: ["400"],
  display: "swap",
});

// Every container supplies its store configuration at runtime; no route may
// bake the bundled development fixture into the shared production image.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const name = SITE_NAME[locale as keyof typeof SITE_NAME] ?? SITE_NAME.fa;
  const t = await getTranslations({ locale, namespace: "home" });

  // Site-wide defaults: canonical/hreflang, OG and Twitter all come from
  // buildMetadata; the root layout only adds what's unique to it (base URL,
  // title template, app name, crawler directives).
  return {
    ...buildMetadata({ locale, path: "", description: t("metadataDescription") }),
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    applicationName: name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const direction = getDirection(locale);
  const requestTheme = await getRequestTheme();

  const localeClassName = locale === "fa" ? "locale-fa" : "locale-en";

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={direction}
      className={`${cairo.variable} ${rakkas.variable} ${figtree.variable} ${caprasimo.variable}`}
    >
      <body className={`font-sans antialiased ${localeClassName}`}>
        <JsonLd data={[organizationSchema(locale), websiteSchema(locale)]} />
        <ThemeProvider
          attribute="class"
          defaultTheme={requestTheme}
          enableSystem
          disableTransitionOnChange
        >
          <ApiQueryProvider>
            <StorefrontConfigProvider value={getStorefrontConfig()}>
              <NextIntlClientProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <OrderProvider>
                      {children}
                      <Cart />
                      <Toaster
                        position={direction === "rtl" ? "bottom-left" : "bottom-right"}
                      />
                    </OrderProvider>
                  </FavoritesProvider>
                </CartProvider>
              </NextIntlClientProvider>
            </StorefrontConfigProvider>
          </ApiQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
