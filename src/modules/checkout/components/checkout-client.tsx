"use client";

import { Link, useRouter } from "@/shared/i18n/navigation";
import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/shared/components/ui/empty";
import { useCart } from "@/modules/cart";
import { useOrders } from "@/modules/account";
import { useProperty } from "@/shared/property/property-provider";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useHydrated } from "@/shared/hooks/use-hydrated";

import { ShoppingBag, MapPin, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { toast } from "sonner";
import type { ResolvedLocation } from "./address-map-picker";
import { useFormatPrice } from "@/shared/property/use-format-price";

// Leaflet touches `window` on import, so the picker is client-only.
const AddressMapPicker = dynamic(() => import("./address-map-picker"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2.5">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-xl border border-border bg-muted sm:h-80" />
    </div>
  ),
});

function getOrderTotals(
  subtotal: number,
  shippingFee: number,
  taxRate: number
) {
  const shipping = shippingFee;
  const tax = subtotal * taxRate;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function createCheckoutFormSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(1, t("checkout.firstNameRequired")),
    lastName: z.string().min(1, t("checkout.lastNameRequired")),
    email: z.string().email(t("checkout.emailInvalid")),
    phone: z.string().min(1, t("checkout.phoneRequired")),
    address: z.string().min(1, t("checkout.addressRequired")),
    city: z.string().min(1, t("checkout.cityRequired")),
    zipCode: z.string().min(1, t("checkout.zipCodeRequired")),
    // Country is filled by pinning the map, never typed by hand.
    country: z.string().min(1, t("checkout.pinRequired")),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  });
}

type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutFormSchema>>;

export default function CheckoutClient() {
  const formatPrice = useFormatPrice();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, openCart } = useCart();
  const { addOrder } = useOrders();
  const { t, locale } = useTranslations();
  const property = useProperty();
  const hydrated = useHydrated();

  const checkoutFormSchema = useMemo(() => createCheckoutFormSchema(t), [t]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  // A resolved pin pours its address into the form; blanks never clobber
  // anything the buyer has already typed.
  const handleLocationResolve = useCallback(
    (loc: ResolvedLocation) => {
      if (loc.address)
        form.setValue("address", loc.address, { shouldValidate: true, shouldDirty: true });
      if (loc.city)
        form.setValue("city", loc.city, { shouldValidate: true, shouldDirty: true });
      if (loc.country)
        form.setValue("country", loc.country, { shouldValidate: true, shouldDirty: true });
      form.setValue("latitude", loc.latitude);
      form.setValue("longitude", loc.longitude);
    },
    [form]
  );

  const detectedCountry = form.watch("country");

  const shippingFee = property.checkout?.shippingFee ?? 10.0;
  const taxRate = property.checkout?.taxRate ?? 0.1;

  const totals = useMemo(
    () => getOrderTotals(getTotalPrice(), shippingFee, taxRate),
    [getTotalPrice, shippingFee, taxRate]
  );

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      // Submit the order request (no online payment — handled offline/on contact)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save order to order history
      addOrder({
        items,
        ...totals,
        status: "pending",
        shippingAddress: values,
      });

      // Clear cart and redirect to success page
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Checkout submission failed:", error);
      toast.error(t("checkout.submitError"));
    }
  };

  // Cart lives in localStorage, so the first render can't know its contents.
  // Hold a neutral loader until hydrated to avoid flashing the empty-cart CTA.
  if (!hydrated) {
    return (
      <PageShell showFooter={false}>
        <div
          role="status"
          aria-label={t("common.loading")}
          className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4"
        >
          <Loader2
            className="size-6 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell showFooter={false}>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Empty className="max-w-md">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBag className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t("common.emptyCart")}</EmptyTitle>
              <EmptyDescription>
                {t("checkout.emptyCartDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild className="w-full">
              <Link href="/products">{t("checkout.browseProducts")}</Link>
            </Button>
          </Empty>
        </div>
      </PageShell>
    );
  }

  const { subtotal, shipping, tax, total } = totals;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <PageShell showFooter={false}>
      {/* Checkout Content */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <button
          type="button"
          onClick={openCart}
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("common.backToCart")}
        </button>
        <span className="golzar-seam mb-3 max-w-[7rem]">
          <span className="petal-dot" aria-hidden="true" />
          <span className="h-px flex-1" aria-hidden="true" />
        </span>
        <h1 className="font-display mb-8 text-3xl tracking-tight text-foreground sm:text-4xl">
          {t("checkout.title")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-3 text-xl">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-1 ring-border">
                      <MapPin className="h-5 w-5" />
                    </span>
                    {t("checkout.shippingInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.firstName")}</FormLabel>
                          <FormControl>
                            <Input autoComplete="given-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.lastName")}</FormLabel>
                          <FormControl>
                            <Input autoComplete="family-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.phone")}</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AddressMapPicker
                    locale={locale}
                    t={t}
                    onResolve={handleLocationResolve}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.address")}</FormLabel>
                        <FormControl>
                          <Textarea
                            autoComplete="street-address"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {t("checkout.apartmentHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.city")}</FormLabel>
                          <FormControl>
                            <Input autoComplete="address-level2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.zipCode")}</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="postal-code"
                              inputMode="numeric"
                              dir="ltr"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Country is read-only — it comes from the pinned map, not
                      the keyboard. */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t("checkout.country")}</FormLabel>
                        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 text-sm">
                          <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          {detectedCountry ? (
                            <span className="text-foreground">{detectedCountry}</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("checkout.countryFromMap")}
                            </span>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden pt-0">
                {/* an ink strip crowning the focal card */}
                <div aria-hidden="true" className="h-1.5 w-full bg-foreground" />
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-3 text-xl">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    {t("checkout.orderSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <SafeImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-sm font-medium text-card-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("common.quantity")}: {item.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium text-card-foreground" dir="ltr">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                        <span className="text-card-foreground" dir="ltr">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                        <span className="text-card-foreground" dir="ltr">
                          {formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("checkout.tax")}</span>
                        <span className="text-card-foreground" dir="ltr">
                          {formatPrice(tax)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                        <span className="text-card-foreground">{t("common.total")}</span>
                        <span className="text-card-foreground" dir="ltr">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 rounded-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t("checkout.processing")}
                      </>
                    ) : (
                      <>
                        {`${t("checkout.completeOrder")} - ${formatPrice(total)}`}
                        <ArrowRight className="size-4 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </PageShell>
  );
}
