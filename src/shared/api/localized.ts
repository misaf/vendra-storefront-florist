export type LocalizedValue<T> = T | Record<string, T>;

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

  if (
    Object.hasOwn(translations, "type") ||
    Object.hasOwn(translations, "content") ||
    Object.hasOwn(translations, "text")
  ) {
    return value as T;
  }

  if (locale && Object.hasOwn(translations, locale)) {
    return translations[locale];
  }

  return Object.values(translations)[0] ?? (value as T);
}
