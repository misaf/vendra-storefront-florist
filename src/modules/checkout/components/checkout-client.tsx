"use client";

import { Link, useRouter } from "@/shared/i18n/navigation";
import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
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
    firstName: z.string().trim().min(1, t("checkout.firstNameRequired")),
    lastName: z.string().trim().min(1, t("checkout.lastNameRequired")),
    email: z.string().trim().email(t("checkout.emailInvalid")),
    phone: z
      .string()
      .trim()
      .min(1, t("checkout.phoneRequired"))
      .refine(
        (value) => value.replace(/[^0-9۰-۹٠-٩]/g, "").length >= 7,
        t("checkout.phoneInvalid")
      ),
    address: z
      .string()
      .trim()
      .min(1, t("checkout.addressRequired"))
      .min(5, t("checkout.addressInvalid")),
    city: z.string().trim().min(1, t("checkout.cityRequired")),
    zipCode: z
      .string()
      .trim()
      .min(1, t("checkout.zipCodeRequired"))
      .refine(
        (value) => {
          const digits = value.replace(/[^0-9۰-۹٠-٩]/g, "");
          return digits.length >= 5 && digits.length <= 10;
        },
        t("checkout.zipCodeInvalid")
      ),
    // Pinning the map fills this in, but it stays typeable: see the field.
    country: z.string().trim().min(1, t("checkout.countryRequired")),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  });
}

type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutFormSchema>>;

export default function CheckoutClient() {
  const formatPrice = useFormatPrice();
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart, openCart } = useCart();
  const { addOrder } = useOrders();
  const { t, locale } = useTranslations();
  const property = useProperty();
  const hydrated = useHydrated();
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const checkoutFormSchema = useMemo(() => createCheckoutFormSchema(t), [t]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
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

  const shippingFee = property.checkout?.shippingFee ?? 10.0;
  const taxRate = property.checkout?.taxRate ?? 0.1;

  const totals = useMemo(
    () => getOrderTotals(getTotalPrice(), shippingFee, taxRate),
    [getTotalPrice, shippingFee, taxRate]
  );

  /**
   * There is no order endpoint in the catalogue API. This step therefore saves
   * an order request locally; the next screen clearly requires the buyer to
   * send its details to the shop over WhatsApp or call. It must never imply
   * that an unsent browser-only record has reached the florist.
   *
   * This deliberately no longer waits two seconds on a `setTimeout` dressed up
   * as a network call: it delayed every buyer by two seconds to imitate work
   * that was not happening, and its `catch` could never fire.
   */
  const onSubmit = (values: CheckoutFormValues) => {
    try {
      addOrder({
        items,
        ...totals,
        status: "pending",
        shippingAddress: values,
      });

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
      <div className="store-container pb-16 pt-8 sm:pb-24 sm:pt-12">
        {/* The back control needs its own line: `.store-eyebrow` is
            `inline-flex`, so an eyebrow following an inline-flex button ran up
            beside it instead of sitting above the title. The eyebrow that used
            to be here is gone as well — it read "Order Summary", which is the
            heading of the card in the right-hand column, so the page announced
            one thing and titled itself another. */}
        <div className="mb-4 hidden lg:block">
          <button
            type="button"
            onClick={openCart}
            className="-ms-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("common.backToCart")}
          </button>
        </div>
        <h1 className="store-page-title mb-8 text-foreground sm:mb-10">
          {t("checkout.title")}
        </h1>

        <button
          type="button"
          onClick={openCart}
          aria-label={`${t("common.viewCart")}: ${formatPrice(total)}`}
          className="mb-7 flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-start transition-colors hover:bg-secondary lg:hidden"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              {t("checkout.orderSummary")}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {t("common.itemsCount", { count: getTotalItems() })}
            </span>
          </span>
          <span className="shrink-0 text-end">
            <span className="block font-bold text-foreground" dir="ltr">
              {formatPrice(total)}
            </span>
            <span className="mt-0.5 block text-xs font-semibold text-primary">
              {t("common.viewCart")}
            </span>
          </span>
        </button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={isSubmitting} className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.75fr)] lg:gap-12">
            {/* Left Column - Forms */}
            <div className="min-w-0 space-y-6">
              {/* Shipping Information */}
              <Card className="min-w-0 overflow-hidden border-0 bg-card/65 shadow-none">
                <CardHeader>
                  <h2 className="font-display flex items-center gap-3 text-xl font-semibold leading-none">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
                      <MapPin className="h-5 w-5" />
                    </span>
                    {t("checkout.shippingInformation")}
                  </h2>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {t("checkout.requiredFieldsHint")}
                  </p>
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
                            <Input
                              autoComplete="given-name"
                              aria-required="true"
                              {...field}
                            />
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
                            <Input
                              autoComplete="family-name"
                              aria-required="true"
                              {...field}
                            />
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
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-required="true"
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
                            aria-required="true"
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
                            aria-required="true"
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
                            <Input
                              autoComplete="address-level2"
                              aria-required="true"
                              {...field}
                            />
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
                              aria-required="true"
                              dir="ltr"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Pinning the map fills this in, and it is still typeable.
                      It used to be `readOnly`, which made the one required
                      field on the form impossible to satisfy by hand — so a
                      failed tile load, a rate-limited geocoder or a blocked
                      third-party request left the buyer with a checkout that
                      could never be submitted and no way to see why. */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("checkout.country")}</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="country-name"
                            placeholder={t("checkout.countryFromMap")}
                            aria-required="true"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="min-w-0">
              <Card className="store-sticky min-w-0 overflow-hidden border-0 bg-storefront-brand pt-0 text-storefront-brand-foreground shadow-xl shadow-storefront-brand/20">
                <div aria-hidden="true" className="h-1.5 w-full bg-rose" />
                <CardHeader>
                  <h2 className="font-display flex items-center gap-3 text-2xl font-semibold leading-none text-storefront-brand-foreground">
                    <span className="flex size-9 items-center justify-center rounded-full bg-storefront-brand-foreground text-storefront-brand">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    {t("checkout.orderSummary")}
                  </h2>
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
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="store-dynamic-text text-sm font-medium text-storefront-brand-foreground">
                            <bdi>{item.name}</bdi>
                          </p>
                          <p className="text-xs text-storefront-brand-foreground/80">
                            {t("common.quantity")}: {numberFormat.format(item.quantity)}
                          </p>
                          <p className="mt-1 text-sm font-medium text-storefront-brand-foreground" dir="ltr">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-storefront-brand-foreground/25 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-storefront-brand-foreground/80">{t("checkout.subtotal")}</span>
                        <span className="text-storefront-brand-foreground" dir="ltr">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-storefront-brand-foreground/80">{t("checkout.shipping")}</span>
                        <span className="text-storefront-brand-foreground" dir="ltr">
                          {formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-storefront-brand-foreground/80">{t("checkout.tax")}</span>
                        <span className="text-storefront-brand-foreground" dir="ltr">
                          {formatPrice(tax)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-storefront-brand-foreground/25 pt-3 text-lg font-bold">
                        <span className="text-storefront-brand-foreground">{t("common.total")}</span>
                        <span className="text-storefront-brand-foreground" dir="ltr">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 bg-storefront-brand-foreground text-storefront-brand hover:bg-storefront-brand-foreground/90"
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
