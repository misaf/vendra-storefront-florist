import type { MetadataRoute } from "next";
import { fetchProductsWithDetails } from "@/modules/products";
import { fetchBlogPostsWithDetails } from "@/modules/blog";
import { routing, type Locale } from "@/shared/i18n/routing";
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
type LocalizedPaths = Partial<Record<Locale, string>>;
type LocalizedSlugEntry = {
  id: string | number;
  slugs: Partial<Record<Locale, string>>;
  updatedAt?: string;
};

/** One entry whose hreflang URLs may use different localized slugs. */
function localizedEntry(
  paths: LocalizedPaths,
  options: {
    lastModified?: string | Date;
    changeFrequency?: ChangeFreq;
    priority?: number;
  } = {}
): MetadataRoute.Sitemap[number] | null {
  const defaultPath =
    paths[routing.defaultLocale] ??
    routing.locales.map((locale) => paths[locale]).find(Boolean);

  if (!defaultPath) {
    return null;
  }

  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const path = paths[locale];
    if (path) {
      languages[locale] = absoluteUrl(localizedPath(locale, path));
    }
  }
  languages["x-default"] = absoluteUrl(
    localizedPath(routing.defaultLocale, defaultPath)
  );

  return {
    url: absoluteUrl(localizedPath(routing.defaultLocale, defaultPath)),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  };
}

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

/** Load and merge the localized slug for every resource id. */
async function collectLocalizedSlugs(
  label: string,
  loadPage: (
    locale: Locale,
    page: number
  ) => Promise<{
    entries: { id: string | number; slug?: string; updatedAt?: string }[];
    lastPage: number;
  }>
): Promise<LocalizedSlugEntry[]> {
  const byId = new Map<string, LocalizedSlugEntry>();

  await Promise.all(
    routing.locales.map(async (locale) => {
      const items = await collectSlugs(`${label} (${locale})`, (page) =>
        loadPage(locale, page)
      );

      for (const item of items) {
        const key = String(item.id);
        const existing = byId.get(key) ?? {
          id: item.id,
          slugs: {},
          updatedAt: item.updatedAt,
        };
        existing.slugs[locale] = item.slug;
        existing.updatedAt ??= item.updatedAt;
        byId.set(key, existing);
      }
    })
  );

  return [...byId.values()];
}

function localizedResourcePaths(
  prefix: "/products" | "/blog",
  item: LocalizedSlugEntry
): LocalizedPaths {
  const paths: LocalizedPaths = {};

  for (const locale of routing.locales) {
    const slug = item.slugs[locale];
    if (slug) {
      paths[locale] = `${prefix}/${createReadableResourcePath(item.id, slug)}`;
    }
  }

  return paths;
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
    collectLocalizedSlugs("products", async (locale, page) => {
      const result = await fetchProductsWithDetails({
        page,
        perPage: SITEMAP_PAGE_SIZE,
        locale,
      });
      return { entries: result.products, lastPage: result.pagination.lastPage };
    }),
    collectLocalizedSlugs("blog posts", async (locale, page) => {
      const result = await fetchBlogPostsWithDetails({
        page,
        perPage: SITEMAP_PAGE_SIZE,
        locale,
      });
      return { entries: result.posts, lastPage: result.pagination.lastPage };
    }),
  ]);

  const productEntries = products
    .map((product) =>
      localizedEntry(localizedResourcePaths("/products", product), {
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: product.updatedAt,
      })
    )
    .filter((item): item is MetadataRoute.Sitemap[number] => item !== null);

  const postEntries = posts
    .map((post) =>
      localizedEntry(localizedResourcePaths("/blog", post), {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: post.updatedAt,
      })
    )
    .filter((item): item is MetadataRoute.Sitemap[number] => item !== null);

  return [...staticEntries, ...productEntries, ...postEntries];
}
