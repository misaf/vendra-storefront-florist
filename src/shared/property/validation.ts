import schema from "../../../properties/schema.json";

/**
 * Runtime validation of the `STOREFRONT_CONFIG_BASE64` property configuration.
 *
 * Mirrors `scripts/validate-property.mjs` so both sides interpret the single
 * source of truth (`properties/schema.json`) identically. The interpreter is
 * intentionally small — it covers the JSON Schema subset the file uses.
 */

type SchemaNode = {
  type?: string;
  required?: string[];
  properties?: Record<string, SchemaNode>;
  additionalProperties?: boolean | Record<string, unknown>;
  minLength?: number;
  format?: string;
  minimum?: number;
  exclusiveMinimum?: number;
};

const FORMATS: Record<string, (value: string) => boolean> = {
  uri: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email: (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
};

function checkValue(
  value: unknown,
  node: SchemaNode,
  path: string,
  errors: string[]
) {
  if (node.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${path || "config"} must be an object`);
      return;
    }

    const record = value as Record<string, unknown>;

    for (const key of node.required ?? []) {
      if (record[key] === undefined || record[key] === null || record[key] === "") {
        errors.push(`${path}${path ? "." : ""}${key} is required`);
      }
    }

    const properties = node.properties ?? {};
    if (node.additionalProperties === false) {
      for (const key of Object.keys(record)) {
        if (!properties[key]) {
          errors.push(`${path}${path ? "." : ""}${key} is not allowed`);
        }
      }
    }

    for (const [key, subNode] of Object.entries(properties)) {
      if (record[key] !== undefined && record[key] !== null) {
        checkValue(record[key], subNode, `${path}${path ? "." : ""}${key}`, errors);
      }
    }
    return;
  }

  if (node.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${path} must be a string`);
      return;
    }
    if (typeof node.minLength === "number" && value.length < node.minLength) {
      errors.push(`${path} must be at least ${node.minLength} characters`);
    }
    if (node.format && FORMATS[node.format] && !FORMATS[node.format](value)) {
      errors.push(`${path} is not a valid ${node.format}`);
    }
    return;
  }

  if (node.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) {
      errors.push(`${path} must be a number`);
      return;
    }
    if (typeof node.minimum === "number" && value < node.minimum) {
      errors.push(`${path} must be >= ${node.minimum}`);
    }
    if (
      typeof node.exclusiveMinimum === "number" &&
      value <= node.exclusiveMinimum
    ) {
      errors.push(`${path} must be > ${node.exclusiveMinimum}`);
    }
  }
}

/** Validate an unknown config. Returns a list of errors (empty when valid). */
export function validatePropertyConfig(value: unknown): string[] {
  const errors: string[] = [];
  checkValue(value, schema as SchemaNode, "", errors);
  return errors;
}

/** True when the value satisfies `properties/schema.json`. */
export function isPropertyConfig(value: unknown): boolean {
  return validatePropertyConfig(value).length === 0;
}
