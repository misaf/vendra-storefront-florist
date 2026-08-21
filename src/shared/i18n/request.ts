import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getMessageOverrides } from "@/shared/property";
import { mergeMessages } from "./merge-messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const base = (await import(`../../../messages/${locale}.json`)).default;

  return {
    locale,
    messages: mergeMessages(base, getMessageOverrides()[locale] ?? {}),
  };
});
