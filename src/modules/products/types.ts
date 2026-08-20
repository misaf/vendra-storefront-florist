import type {
  JsonApiLinks,
  JsonApiPageMeta,
  ResourceReference,
} from "@/shared/api/types";
import type { LocalizedValue } from "@/shared/api/localized";

export interface ApiResource {
  id: string | number;
  type?: string;
  relationshipNames?: string[];
}

export interface ProductMedia extends ApiResource {
  url?: string;
  uuid?: string;
  generatedConversions?: Record<string, unknown>;
  fileName?: string;
  generated_conversions?: Record<string, unknown>;
  file_name?: string;
  name?: string;
}

export type ProductCategorySummary = ResourceReference;

export interface ProductPriceValue {
  amount?: number | string | null;
  currency?: string | null;
  formatted?: string | null;
}

export type ProductPriceField = number | string | ProductPriceValue | null;

export interface ProductPriceDto extends ApiResource {
  minorAmount?: number | null;
  currency?: string;
  formatted?: string;
  price?: ProductPriceField;
  sale_price?: ProductPriceField;
  final_price?: ProductPriceField;
  amount?: ProductPriceField;
  value?: ProductPriceField;
  attributes?: {
    price?: ProductPriceField;
    sale_price?: ProductPriceField;
    final_price?: ProductPriceField;
    amount?: ProductPriceField;
    value?: ProductPriceField;
  };
}

export interface ProductDto extends ApiResource {
  name: LocalizedValue<string>;
  description?: LocalizedValue<unknown>;
  price?: number | string | null;
  sale_price?: number | string | null;
  final_price?: number | string | null;
  slug?: LocalizedValue<string>;
  token?: string;
  quantity?: number | null;
  in_stock?: boolean;
  inStock?: boolean;
  /** Count at or below which the catalogue considers stock low. */
  stockThreshold?: number | null;
  stock_threshold?: number | null;
  /** Set by the catalogue when a sold-out product is expected back. */
  availableSoon?: boolean;
  available_soon?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  multimedia?: ProductMedia | ProductMedia[];
  media?: ProductMedia | ProductMedia[];
  productCategory?: ProductCategorySummary | ProductCategorySummary[];
  productCategories?: ProductCategorySummary | ProductCategorySummary[];
  product_category?: ProductCategorySummary | ProductCategorySummary[];
  category?: ProductCategorySummary | ProductCategorySummary[];
  categories?: ProductCategorySummary | ProductCategorySummary[];
  latestProductPrice?: ProductPriceDto | ProductPriceDto[];
  latest_product_price?: ProductPriceDto | ProductPriceDto[];
  productPrices?: ProductPriceDto | ProductPriceDto[];
  product_prices?: ProductPriceDto | ProductPriceDto[];
}

export interface ProductCategoryDto extends ApiResource {
  name: LocalizedValue<string>;
  description: LocalizedValue<unknown>;
  slug: LocalizedValue<string>;
  position: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  updated_at?: string;
  multimedia?: ProductMedia | ProductMedia[];
  media?: ProductMedia | ProductMedia[];
}

export type Pagination = Pick<
  JsonApiPageMeta,
  "currentPage" | "lastPage" | "perPage" | "total" | "from" | "to"
>;

export type CollectionLinks = Pick<
  JsonApiLinks,
  "first" | "last" | "next" | "prev"
>;

export interface Product {
  id: number;
  name: string;
  price: number;
  formattedPrice?: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  image: string;
  images?: string[];
  description: string;
  richDescription?: unknown;
  category?: string;
  categorySlug?: string;
  slug?: string;
  token?: string;
  inStock?: boolean;
  quantity?: number | null;
  /** Count at or below which stock counts as low. 0/absent means untracked. */
  stockThreshold?: number | null;
  /** A sold-out product the catalogue expects to restock. */
  availableSoon?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  richDescription?: unknown;
  position: number;
  status: boolean;
  updated_at?: string;
  image?: string;
}

export interface FetchProductsParams {
  page?: number;
  perPage?: number;
  category?: string;
  locale?: string;
  search?: string;
  slug?: string;
  sort?: string;
}

export interface FetchProductsResult {
  products: Product[];
  pagination: Pagination;
  links: CollectionLinks;
}

export interface ProductPayload {
  name?: string;
  description?: unknown;
  price?: number | string | null;
  sale_price?: number | string | null;
  final_price?: number | string | null;
  slug?: string;
  token?: string;
  quantity?: number | null;
  in_stock?: boolean;
}

export type CreateProductPayload = ProductPayload;

export interface UpdateProductVariables {
  id: string | number;
  data: ProductPayload;
}
