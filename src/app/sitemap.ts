import type { MetadataRoute } from "next";
import { fetchProductsWithDetails } from "@/modules/products";
import { fetchBlogPostsWithDetails } from "@/modules/blog";
import { routing } from "@/shared/i18n/routing";
import { absoluteUrl, localizedPath } from "@/shared/seo";
import { createReadableResourcePath } from "@/shared/lib/slug-url";

export const dynamic = "force-dynamic";

const SITEMAP_PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety cap (≈5k entries per collection)

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

/** One entry per locale-less path, with hreflang alternates for every locale. */
function entry(
  path: string,
  options: { lastModified?: string | Date; changeFrequency?: ChangeFreq; priority?: number } = {}
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath(routing.defaultLocale, path));

  return {
    url: absoluteUrl(localizedPath(routing.defaultLocale, path)),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  };
}

type SlugEntry = { id: string | number; slug: string; updatedAt?: string };

/** Paginate a collection, accumulating every entry with a slug. */
async function collectSlugs(
  label: string,
  loadPage: (
    page: number
  ) => Promise<{
    entries: { id: string | number; slug?: string; updatedAt?: string }[];
    lastPage: number;
  }>
): Promise<SlugEntry[]> {
  const items: SlugEntry[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { entries, lastPage } = await loadPage(page);
      for (const item of entries) {
        if (item.slug) {
          items.push({ id: item.id, slug: item.slug, updatedAt: item.updatedAt });
        }
      }
      if (page >= lastPage) break;
    }
  } catch (error) {
    console.error(`sitemap: failed to load ${label}`, error);
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    entry("", { changeFrequency: "daily", priority: 1, lastModified: now }),
    entry("/products", { changeFrequency: "daily", priority: 0.9, lastModified: now }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.7, lastModified: now }),
    entry("/about", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/faq", { changeFrequency: "monthly", priority: 0.5 }),
  ];

  const [products, posts] = await Promise.all([
    collectSlugs("products", async (page) => {
      const result = await fetchProductsWithDetails({ page, perPage: SITEMAP_PAGE_SIZE });
      return { entries: result.products, lastPage: result.pagination.lastPage };
    }),
    collectSlugs("blog posts", async (page) => {
      const result = await fetchBlogPostsWithDetails({ page, perPage: SITEMAP_PAGE_SIZE });
      return { entries: result.posts, lastPage: result.pagination.lastPage };
    }),
  ]);

  const productEntries = products.map((p) =>
    entry(`/products/${createReadableResourcePath(p.id, p.slug)}`, {
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: p.updatedAt,
    })
  );

  const postEntries = posts.map((p) =>
    entry(`/blog/${createReadableResourcePath(p.id, p.slug)}`, {
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: p.updatedAt,
    })
  );

  return [...staticEntries, ...productEntries, ...postEntries];
}
