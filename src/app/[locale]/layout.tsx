import type { Metadata } from "next";
import { Vazirmatn, Geist } from "next/font/google";
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
import { getSiteUrl } from "@/shared/lib/config";
import { getProperty } from "@/shared/property";
import { PropertyProvider } from "@/shared/property/property-provider";
import { getRequestTheme } from "@/shared/lib/theme-server";
import {
  SITE_NAME,
  buildMetadata,
  organizationSchema,
  websiteSchema,
} from "@/shared/seo";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  // Only what the storefront actually sets. 800 was requested and never
  // used — one extra font file per subset on the default locale's critical path.
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Every container supplies its property at runtime; no route may bake the
// bundled development property into the shared production image.
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
      className={`${vazirmatn.variable} ${geist.variable}`}
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
            <PropertyProvider value={getProperty()}>
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
            </PropertyProvider>
          </ApiQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
