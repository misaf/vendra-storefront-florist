import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartPage } from "@/modules/cart";
import { buildMetadata } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    ...buildMetadata({
      locale,
      path: "/cart",
      title: t("shoppingCart"),
      description: t("cartDeliveryNote"),
    }),
    // A cart is one shopper's own state; there is nothing here to index.
    robots: { index: false, follow: true },
  };
}

export default function Cart() {
  return <CartPage />;
}
