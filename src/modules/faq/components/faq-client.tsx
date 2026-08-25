"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRight, HelpCircle, Search } from "lucide-react";
import { PageShell } from "@/shared/components/layout/page-shell";
import { PageHeader } from "@/shared/components/layout/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { fetchFaqs } from "../lib/queries";
import type { Faq, FaqCategory } from "../types";
import { cn } from "@/shared/lib/utils";

interface FaqClientProps {
  initialFaqs: Faq[];
  initialCategories: FaqCategory[];
  initialError: string | null;
}

const UNCATEGORIZED_KEY = "__uncategorized__";

/** The grouping key for a FAQ: its category slug, or the uncategorized bucket. */
const bucketKey = (faq: Faq) => faq.categorySlug || UNCATEGORIZED_KEY;

interface Bucket {
  key: string;
  name: string;
}

export default function FaqClient({
  initialFaqs,
  initialCategories,
  initialError,
}: FaqClientProps) {
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category")?.trim() || "all";

  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [error, setError] = useState<string | null>(initialError);
  const [reloading, setReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const reload = useCallback(async () => {
    setReloading(true);
    setError(null);
    try {
      const result = await fetchFaqs({ perPage: 100, locale });
      setFaqs(result);
    } catch (err) {
      console.error("Error loading FAQs:", err);
      setError(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setReloading(false);
    }
  }, [locale]);

  // Category buckets in catalogue order, with uncategorized last.
  const buckets = useMemo<Bucket[]>(() => {
    const present = new Set(faqs.map(bucketKey));
    const ordered: Bucket[] = [];
    for (const category of initialCategories) {
      if (present.has(category.slug)) {
        ordered.push({ key: category.slug, name: category.name });
      }
    }
    if (present.has(UNCATEGORIZED_KEY)) {
      ordered.push({ key: UNCATEGORIZED_KEY, name: t("faq.generalCategory") });
    }
    return ordered;
  }, [faqs, initialCategories, t]);

  // Search narrows the working set; counts and the ledger derive from it.
  const matched = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(locale);
    if (!query) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLocaleLowerCase(locale).includes(query) ||
        faq.answer.toLocaleLowerCase(locale).includes(query)
    );
  }, [faqs, searchQuery, locale]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of matched) {
      const key = bucketKey(faq);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [matched]);

  const visible = useMemo(() => {
    if (selectedCategory === "all") return matched;
    return matched.filter((faq) => bucketKey(faq) === selectedCategory);
  }, [matched, selectedCategory]);

  // Group the visible entries by bucket in a single pass so the ledger reads
  // as a guide.
  const groups = useMemo(() => {
    const byKey = new Map<string, Faq[]>();
    for (const faq of visible) {
      const key = bucketKey(faq);
      const list = byKey.get(key);
      if (list) list.push(faq);
      else byKey.set(key, [faq]);
    }
    return buckets
      .map((bucket) => ({ ...bucket, items: byKey.get(bucket.key) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [buckets, visible]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      router.replace(
        {
          pathname: "/faq",
          query: Object.fromEntries(params),
        },
        { scroll: false }
      );
    },
    [router, searchParams]
  );

  const toggle = useCallback((id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const railItems = useMemo(
    () => [
      { key: "all", name: t("faq.allCategories"), count: matched.length },
      ...buckets.map((bucket) => ({
        key: bucket.key,
        name: bucket.name,
        count: counts.get(bucket.key) ?? 0,
      })),
    ],
    [buckets, counts, matched.length, t]
  );

  const showGroupHeadings = groups.length > 1;
  const hasResults = visible.length > 0;

  return (
    <PageShell>
      {/* Masthead — quiet porcelain, search promoted as the real task */}
      <section className="border-b border-border">
        <PageHeader
          eyebrow={t("faq.indexLabel")}
          title={t("faq.heading")}
          description={t("faq.subtitle")}
        >
          <div className="relative mt-8 max-w-xl">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("faq.searchPlaceholder")}
              aria-label={t("faq.searchPlaceholder")}
              className="h-11 ps-9"
            />
          </div>
        </PageHeader>
      </section>

      {/* Index rail + hairline ledger */}
      <section className="store-container store-section">
        {error ? (
          <ErrorState
            message={t("faq.loadError")}
            onRetry={reload}
            retryLabel={t("faq.tryAgain")}
            retryingLabel={t("faq.retrying")}
            isRetrying={reloading}
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
            {/* Rail */}
            <aside className="store-sticky-lg lg:rounded-3xl lg:bg-card/55 lg:p-5">
              <p
                id="faq-index-label"
                className="store-label"
              >
                {t("faq.indexLabel")}
              </p>
              {/* Mobile: hairline tab row · Desktop: vertical index */}
              <ul
                aria-labelledby="faq-index-label"
                className="mt-4 flex gap-x-5 overflow-x-auto pb-1 lg:mt-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
              >
                {railItems.map((item) => {
                  const isActive = selectedCategory === item.key;
                  return (
                    <li key={item.key} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => handleCategoryChange(item.key)}
                        className={cn(
                          "group flex min-h-11 w-full items-center justify-between gap-3 whitespace-nowrap rounded-sm py-1.5 text-start transition-colors lg:border-t lg:border-border lg:py-2.5 lg:first:border-t-0",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "petal-dot transition-colors",
                              isActive
                                ? "bg-foreground"
                                : "group-hover:bg-foreground/70"
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              "text-sm",
                              isActive && "font-display tracking-tight"
                            )}
                          >
                            {item.name}
                          </span>
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {numberFormat.format(item.count)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Ledger */}
            <div className="min-w-0">
              <p className="sr-only" role="status" aria-live="polite">
                {t("faq.resultsCount", { count: visible.length })}
              </p>
              {!hasResults ? (
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HelpCircle className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>{t("faq.noResults")}</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery ? t("faq.noSearchResults") : t("faq.noFaqs")}
                    </EmptyDescription>
                  </EmptyHeader>
                  {searchQuery ? (
                    <EmptyContent>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="rounded-sm text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
                      >
                        {t("faq.clearSearch")}
                      </button>
                    </EmptyContent>
                  ) : (
                    <EmptyContent>
                      <Button asChild variant="outline">
                        <Link href="/contact">{t("faq.contactForAnswer")}</Link>
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              ) : (
                <div className="space-y-12">
                  {groups.map((group) => (
                    <section key={group.key} aria-label={group.name}>
                      {showGroupHeadings ? (
                        <div className="mb-1 flex items-center gap-2.5">
                          <span className="petal-dot" aria-hidden="true" />
                          <h2 className="store-label">
                            {group.name}
                          </h2>
                        </div>
                      ) : (
                        <h2 className="sr-only">{group.name}</h2>
                      )}
                      {/* Separated blocks, not a hairline-ruled list: the
                          Organic system gives each answer its own resting
                          surface, which is also what makes an opened panel
                          read as belonging to the question above it rather
                          than to the rule between them. */}
                      <ul className="flex flex-col gap-3">
                        {group.items.map((faq) => {
                          const open = openIds.has(faq.id);
                          const hasAnswer = faq.answer.trim().length > 0;
                          const panelId = `faq-panel-${faq.id}`;
                          return (
                            <li
                              key={faq.id}
                              className="overflow-hidden rounded-3xl bg-card"
                            >
                              <div>
                                {hasAnswer ? (
                                  <h3>
                                    <button
                                      type="button"
                                      aria-expanded={open}
                                      aria-controls={panelId}
                                      onClick={() => toggle(faq.id)}
                                      className="group flex min-h-14 w-full items-start justify-between gap-5 px-6 py-5 text-start"
                                    >
                                      <span
                                        className="font-display text-xl leading-snug text-foreground [.locale-fa_&]:leading-[1.75] sm:text-2xl"
                                      >
                                        {faq.question}
                                      </span>
                                      {/* The system's round sign chip: the
                                          plus loses its vertical stroke to
                                          become a minus, so open and closed
                                          are one shape rather than two icons
                                          swapping places. */}
                                      <span
                                        className="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-background text-primary transition-colors group-hover:bg-accent"
                                        aria-hidden="true"
                                      >
                                        <span className="absolute inset-x-0 mx-auto h-px w-3.5 bg-current" />
                                        <span
                                          data-open={open ? "" : undefined}
                                          className="absolute inset-y-0 my-auto h-3.5 w-px bg-current motion-safe:transition-transform data-[open]:scale-y-0"
                                        />
                                      </span>
                                    </button>
                                  </h3>
                                ) : (
                                  <div className="px-6 py-5">
                                    <h3 className="font-display text-xl leading-snug text-foreground [.locale-fa_&]:leading-[1.75] sm:text-2xl">
                                      {faq.question}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                      <span>{t("faq.answerUnavailable")}</span>
                                      <Link
                                        href={{
                                          pathname: "/contact",
                                          query: { subject: faq.question },
                                        }}
                                        className="rounded-sm font-semibold text-primary underline underline-offset-4"
                                      >
                                        {t("faq.contactForAnswer")}
                                      </Link>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {hasAnswer ? (
                                <div
                                  id={panelId}
                                  data-open={open ? "" : undefined}
                                  aria-hidden={!open}
                                  className="grid grid-rows-[0fr] motion-safe:transition-[grid-template-rows] motion-safe:duration-300 data-[open]:grid-rows-[1fr]"
                                >
                                  <div className="overflow-hidden">
                                    <p className="max-w-2xl px-6 pb-6 text-sm leading-7 text-muted-foreground">
                                      {faq.answer}
                                    </p>
                                  </div>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* The closing offer, as a tinted panel inside the page rather than a
          full-bleed ink band across it. The band was the page's darkest object
          and sat directly above the ink footer, so the two merged into one
          slab and the page's last word lost its edges. The sage tint is the
          system's quiet call-to-action surface — the same one the newsletter
          panel uses — so the two read as the same kind of invitation. */}
      <section className="bg-background">
        <div className="store-container store-section">
          <div className="grid gap-8 rounded-[2.5rem] bg-sage-100 px-6 py-10 text-sage-900 sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:px-14">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-800 [.locale-fa_&]:tracking-normal">
                {t("faq.closingEyebrow")}
              </p>
              <h2 className="store-section-title mt-4 text-sage-900">
                {t("faq.closingTitle")}
              </h2>
              <p className="store-lede mt-4 max-w-[52ch] text-sm text-sage-800 sm:text-base">
                {t("faq.closingDescription")}
              </p>
            </div>
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/contact">
                {t("faq.contactForAnswer")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
