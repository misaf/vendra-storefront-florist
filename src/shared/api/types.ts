/**
 * A related resource as the API embeds it: identifier, resource type and a
 * localized display label. Relations are never expanded inline, so a reference
 * carries no slug — resolve that from the matching category collection.
 */
export interface ResourceReference {
  id: string | number;
  type?: string;
  label?: string | null;
}

export interface JsonApiPageMeta {
  currentPage: number;
  from: number;
  lastPage: number;
  perPage: number;
  to: number;
  total: number;
}

export interface JsonApiMeta {
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  page?: JsonApiPageMeta;
}

export interface JsonApiLinks {
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
  self?: string;
}
