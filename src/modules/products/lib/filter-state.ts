export type ProductAvailability = "in-stock" | "out-of-stock";

export function normalizeAvailability(
  value: string | undefined | null
): ProductAvailability | undefined {
  return value === "in-stock" || value === "out-of-stock" ? value : undefined;
}

export function availabilityToInStock(
  availability: ProductAvailability | undefined
): boolean | undefined {
  if (availability === "in-stock") return true;
  if (availability === "out-of-stock") return false;
  return undefined;
}
