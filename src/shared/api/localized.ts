export type LocalizedValue<T> = T | Record<string, T>;

/**
 * Resolves a translatable API field.
 *
 * Two shapes arrive from the canonical API and they can be *merged into one
 * object*: a per-locale map (`{ en, fa }`) and — for rich text — the default
 * locale's TipTap document spread alongside it, so a blog post's `description`
 * comes back as `{ en, fa, type: "doc", content: [...] }`. The locale lookup
 * therefore has to run *before* the "this already looks like a document" shape
 * check; the other order silently handed every locale the same document and an
 * English article rendered in Persian.
 */
export function getLocalizedValue<T>(
  value: LocalizedValue<T> | null | undefined,
  locale: string | undefined
): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return value as T;
  }

  const translations = value as Record<string, T>;

  if (locale && Object.hasOwn(translations, locale)) {
    return translations[locale];
  }

  // No entry for this locale: either the value is a bare document/node, or a
  // map that simply lacks the locale. `type`/`content`/`text` only ever belong
  // to the former.
  if (
    Object.hasOwn(translations, "type") ||
    Object.hasOwn(translations, "content") ||
    Object.hasOwn(translations, "text")
  ) {
    return value as T;
  }

  return Object.values(translations)[0] ?? (value as T);
}
