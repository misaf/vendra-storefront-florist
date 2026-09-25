"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Link } from "@/shared/i18n/navigation";
import { fetchFaqs } from "../lib/queries";
import type { Faq, FaqCategory } from "../types";

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

  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [error, setError] = useState<string | null>(initialError);
  const [reloading, setReloading] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

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

  /* Every entry, grouped under its own heading. The page carried a search
     field and a row of category pills; the design has neither, and neither
     was earning its place — the whole set fits on one 900px column, so both
     controls filtered a list the reader can already see all of. */
  const groups = useMemo(() => {
    const byKey = new Map<string, Faq[]>();
    for (const faq of faqs) {
      const key = bucketKey(faq);
      const list = byKey.get(key);
      if (list) list.push(faq);
      else byKey.set(key, [faq]);
    }
    return buckets
      .map((bucket) => ({ ...bucket, items: byKey.get(bucket.key) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [buckets, faqs]);

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

  const showGroupHeadings = groups.length > 1;
  const hasResults = faqs.length > 0;

  return (
    <PageShell>
      {/* Masthead — quiet porcelain, on the narrow measure the design sets
          this page to, with search promoted as the real task. */}
      <section>
        <PageHeader
          className="mx-auto max-w-[56.25rem] pb-[2.125rem] sm:pb-[2.125rem]"
          eyebrow={
            <Badge variant="clay" className="px-3 py-1 text-xs">
              {t("faq.indexLabel")}
            </Badge>
          }
          title={t("faq.heading")}
          description={t("faq.subtitle")}
        />
      </section>

      {/* Index tags + the ledger, one column */}
      <section className="store-container pb-10">
        {error ? (
          <ErrorState
            message={t("faq.loadError")}
            onRetry={reload}
            retryLabel={t("faq.tryAgain")}
            retryingLabel={t("faq.retrying")}
            isRetrying={reloading}
          />
        ) : (
          <div className="mx-auto max-w-[56.25rem]">
            {/* Ledger */}
            <div className="min-w-0">
              {!hasResults ? (
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HelpCircle className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>{t("faq.noResults")}</EmptyTitle>
                    <EmptyDescription>{t("faq.noFaqs")}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild variant="outline">
                      <Link href="/contact">{t("faq.contactForAnswer")}</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-11">
                  {groups.map((group) => (
                    <section key={group.key} aria-label={group.name}>
                      {showGroupHeadings ? (
                        <h2 className="font-display mb-[1.125rem] text-[1.625rem] leading-tight text-foreground [.locale-fa_&]:leading-normal">
                          {group.name}
                        </h2>
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
                              className="overflow-hidden rounded-[1.625rem] bg-card"
                            >
                              <div>
                                {hasAnswer ? (
                                  <h3>
                                    <button
                                      type="button"
                                      aria-expanded={open}
                                      aria-controls={panelId}
                                      onClick={() => toggle(faq.id)}
                                      className="group flex min-h-14 w-full items-center justify-between gap-[1.125rem] px-[1.625rem] py-5 text-start"
                                    >
                                      <span
                                        className="font-display flex-1 text-[1.09375rem] leading-[1.3] text-foreground [.locale-fa_&]:leading-[1.75]"
                                      >
                                        {faq.question}
                                      </span>
                                      {/* The system's round sign chip: the
                                          plus loses its vertical stroke to
                                          become a minus, so open and closed
                                          are one shape rather than two icons
                                          swapping places. */}
                                      <span
                                        className="relative grid size-[1.875rem] shrink-0 place-items-center rounded-full bg-background text-rose transition-colors group-hover:bg-accent"
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
                                    <p className="max-w-2xl px-[1.625rem] pb-6 text-[0.9375rem] leading-[1.68] text-card-foreground/80">
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
        <div className="store-container pb-[6.25rem]">
          <div className="mx-auto flex max-w-[56.25rem] flex-wrap items-center justify-between gap-[1.875rem] rounded-[2.25rem] bg-sage-100 px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(2rem,5vw,2.75rem)] text-sage-900">
            <div className="max-w-[38ch]">
              <h2 className="font-display text-[1.625rem] leading-tight text-sage-900 [.locale-fa_&]:leading-normal">
                {t("faq.closingTitle")}
              </h2>
              <p className="store-lede mt-2 text-[0.9375rem] text-sage-800">
                {t("faq.closingDescription")}
              </p>
            </div>
            <Button asChild size="lg" className="h-[2.875rem] gap-2 px-6 text-[0.9375rem]">
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
