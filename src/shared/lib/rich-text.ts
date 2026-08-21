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

interface TiptapNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
}

function mapNodes(
  node: TiptapNode,
  transform: (node: TiptapNode) => TiptapNode
): TiptapNode {
  const mapped = transform(node);
  return Array.isArray(mapped.content)
    ? { ...mapped, content: mapped.content.map((child) => mapNodes(child, transform)) }
    : mapped;
}

function forEachNode(node: TiptapNode, visit: (node: TiptapNode) => void): void {
  visit(node);
  node.content?.forEach((child) => forEachNode(child, visit));
}

function headingLevel(node: TiptapNode): number | null {
  if (node.type !== "heading") return null;
  const level = node.attrs?.level;
  return typeof level === "number" ? level : null;
}

/**
 * Demotes an authored `h1` so the page keeps exactly one — the post title.
 *
 * The backend editor offers every heading level, so an author can open an
 * article with an `h1` and produce a document with two top-level headings.
 * Shifting *every* heading down by one keeps the relative outline the author
 * wrote (an `h2` subsection stays subordinate to the `h1` above it) instead of
 * flattening both into `h2`. `h6` has nowhere to go and stays put.
 */
export function demoteDocumentHeadings(document: unknown): unknown {
  const node = document as TiptapNode | null;
  if (!node || typeof node !== "object") return document;

  let hasTopLevelHeading = false;
  forEachNode(node, (candidate) => {
    if (headingLevel(candidate) === 1) hasTopLevelHeading = true;
  });

  if (!hasTopLevelHeading) return document;

  return mapNodes(node, (candidate) => {
    const level = headingLevel(candidate);
    return level === null
      ? candidate
      : { ...candidate, attrs: { ...candidate.attrs, level: Math.min(6, level + 1) } };
  });
}

/**
 * Words in a rich-text value. Whitespace-separated, which counts Persian and
 * English alike — both scripts space their words.
 */
export function countRichTextWords(value: unknown): number {
  const text = stringifyRichText(value).trim();
  return text ? text.split(/\s+/).length : 0;
}

/**
 * Whole minutes to read a rich-text value, floored at 1. 200 wpm is the usual
 * silent-reading estimate; the figure is rounded because a reading time is a
 * hint, not a measurement.
 */
export function estimateReadingMinutes(value: unknown): number {
  const words = countRichTextWords(value);
  return words > 0 ? Math.max(1, Math.round(words / 200)) : 0;
}
