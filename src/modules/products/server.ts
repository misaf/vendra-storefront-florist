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
  loadProductsPage,
  loadRelatedProducts,
  normalizeCategory,
  normalizeSort,
} from "./lib/load";
export type { LoadProductsPageResult } from "./lib/load";
export {
  availabilityToInStock,
  normalizeAvailability,
  type ProductAvailability,
} from "./lib/filter-state";
export type {
  FetchProductsParams,
  FetchProductsResult,
  Product,
  ProductCategory,
} from "./types";
