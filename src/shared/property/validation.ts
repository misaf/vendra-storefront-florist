import schema from "../../../config/storefront.schema.json";
import { checkAgainstSchema, type SchemaNode } from "./schema-check";

/**
 * Runtime validation of the decoded `STOREFRONT_CONFIG_BASE64` document.
 *
 * Binds the single source of truth (`config/storefront.schema.json`) to the
 * shared checker in `./schema-check`. `scripts/storefront-config.mjs` runs that
 * same checker against the same file before a store is provisioned, so a config
 * that passes there cannot fail here.
 */

/** Validate an unknown config. Returns a list of errors (empty when valid). */
export function validatePropertyConfig(value: unknown): string[] {
  return checkAgainstSchema(value, schema as SchemaNode);
}

/** True when the value satisfies `config/storefront.schema.json`. */
export function isPropertyConfig(value: unknown): boolean {
  return validatePropertyConfig(value).length === 0;
}
