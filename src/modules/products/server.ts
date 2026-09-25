import "server-only";

export {
  fetchProduct,
  fetchProductBySlug,
  fetchProductCategories,
  fetchProducts,
  fetchProductsWithDetails,
  searchCatalogProducts,
} from "./lib/server-queries";
export {
  getProduct,
  loadCatalogPriceRange,
  loadProductsPage,
  loadRelatedProducts,
  normalizeCategory,
  normalizePrice,
  normalizeSort,
} from "./lib/load";
export type { LoadProductsPageResult } from "./lib/load";
export {
  availabilityToInStock,
  isPriceRangeActive,
  normalizeAvailability,
  normalizePriceBound,
  resolvePriceRange,
  type ProductAvailability,
} from "./lib/filter-state";
export type {
  FetchProductsParams,
  FetchProductsResult,
  Product,
  ProductCategory,
  ProductPriceRange,
} from "./types";
