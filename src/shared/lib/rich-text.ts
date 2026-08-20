/**
 * Flattens an arbitrary rich-text value (string, number, array, or a
 * `{ text }` / `{ content }` node tree) into a plain string.
 */
export function stringifyRichText(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("{")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return stringifyRichText(parsed);
      } catch {
        return value;
      }
    }

    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(stringifyRichText).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.text === "string") return record.text;
    if (Array.isArray(record.content)) return stringifyRichText(record.content);
  }

  return "";
}

/** Flattens rich text, strips HTML tags, and truncates to `maxLength`. */
export function stripHtml(text: unknown, maxLength: number): string {
  const value = stringifyRichText(text);
  return value ? value.replace(/<[^>]*>/g, "").substring(0, maxLength) : "";
}

/** Minimal shape check for a TipTap document — deliberately free of any
 *  `@tiptap/*` import so callers can gate on content without pulling the
 *  renderer (and prosemirror) into their bundle. */
function isTiptapDocument(value: unknown): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      (value as { type?: unknown }).type === "doc"
  );
}

export function parseTiptapDocument(value: unknown): Record<string, unknown> | null {
  if (isTiptapDocument(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isTiptapDocument(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function hasRenderableTiptap(value: unknown): boolean {
  const document = parseTiptapDocument(value);
  return (
    Boolean(document) &&
    Array.isArray(document?.content) &&
    (document!.content as unknown[]).length > 0
  );
}

/** Whether `content` has anything renderable — use to gate wrappers/cards. */
export function hasRichTextContent(value: unknown): boolean {
  if (hasRenderableTiptap(value)) {
    return true;
  }
  return typeof value === "string" && value.trim().length > 0;
}
