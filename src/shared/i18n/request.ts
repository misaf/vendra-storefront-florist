import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { messageOverrides } from "@/shared/property";
import { routing } from "./routing";

type MessageTree = Record<string, unknown>;

function isTree(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Property overrides win over the base catalogue key by key, so a property only
 * restates the strings that carry its brand.
 */
function mergeMessages(base: MessageTree, overrides: MessageTree): MessageTree {
  const merged: MessageTree = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key];

    merged[key] =
      isTree(current) && isTree(value) ? mergeMessages(current, value) : value;
  }

  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const base = (await import(`../../../messages/${locale}.json`)).default;

  return {
    locale,
    messages: mergeMessages(base, messageOverrides[locale] ?? {}),
  };
});
