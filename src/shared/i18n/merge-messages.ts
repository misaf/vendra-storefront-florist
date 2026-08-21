/**
 * Deep-merge of a store's message overrides over the base catalogue.
 *
 * The base catalogue in `messages/` is deliberately brand-neutral; a store
 * restates only the strings that carry its brand, and everything it does not
 * mention falls through. Overrides win key by key, at any depth.
 *
 * Pure and dependency-free so the rule can be tested without next-intl or a
 * store configuration.
 */

export type MessageTree = Record<string, unknown>;

function isTree(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merge `overrides` over `base`, recursing only where both sides are objects.
 *
 * Where they disagree in shape the override wins outright — a store that
 * replaces a group with a string means it, and silently keeping the base's
 * subtree would render a mix of two stores' copy.
 */
export function mergeMessages(
  base: MessageTree,
  overrides: MessageTree
): MessageTree {
  const merged: MessageTree = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key];

    merged[key] =
      isTree(current) && isTree(value) ? mergeMessages(current, value) : value;
  }

  return merged;
}
