export { CategoryMediaImage } from "./components/category-media-image";
export { CategoryMenu } from "./components/category-menu";
export {
  HomeProductsSection,
  type HomeProductCategory,
} from "./components/home-products-section";
export { default as ProductDetailClient } from "./components/product-detail-client";
export { default as ProductsClient } from "./components/products-client";
export { ThemedProductImage } from "./components/themed-product-image";
export {
  fetchProduct,
  fetchProductBySlug,
  fetchProductCategories,
  fetchProducts,
  fetchProductsWithDetails,
  transformProduct,
  useProduct,
  useProductCategories,
  useProducts,
} from "./lib/queries";
export {
  getProduct,
  loadProductsPage,
  loadRelatedProducts,
  normalizeCategory,
  normalizeSort,
} from "./lib/load";
export type { LoadProductsPageResult } from "./lib/load";
export type {
  FetchProductsParams,
  FetchProductsResult,
  Product,
  ProductCategory,
} from "./types";
