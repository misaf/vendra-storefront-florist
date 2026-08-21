const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Latin digits rewritten in the locale's own numerals.
 *
 * `Intl.NumberFormat` cannot do this job here: these strings are clock times
 * and phone numbers, not numbers — reformatting them as numbers would group
 * thousands into a phone number and lose a leading zero from "08:00".
 */
export function toLocaleDigits(value: string, locale: string): string {
  return locale === "fa"
    ? value.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)])
    : value;
}

/**
 * A shop's opening span, e.g. "08:00 – 21:00" or "۰۸:۰۰ تا ۲۱:۰۰".
 *
 * Shared because two pages state the same fact from the same property
 * configuration: the contact page's hours panel and the home page's hero. It
 * used to be private to the contact page, so the second caller would have had
 * to restate the Persian separator and the digit mapping.
 */
export function formatBusinessHours(
  open: string,
  close: string,
  locale: string
): string {
  const separator = locale === "fa" ? "تا" : "–";
  return `${toLocaleDigits(open, locale)} ${separator} ${toLocaleDigits(close, locale)}`;
}
