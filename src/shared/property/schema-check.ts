/**
 * Minimal JSON Schema (draft-07 subset) checker.
 *
 * One implementation, two callers: the app validates the decoded
 * `STOREFRONT_CONFIG_BASE64` with it at boot, and `scripts/storefront-config.mjs`
 * validates a config document before anyone provisions a store with it. Node
 * strips the types when the script imports this file, so the two can no longer
 * drift the way separate JS and TS copies did.
 *
 * It interprets only the subset `config/storefront.schema.json` actually uses:
 * type checks, required fields, `additionalProperties: false`, string
 * minLength/format, and numeric bounds. Anything richer belongs in a real
 * validator, not here.
 */

export type SchemaNode = {
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

function join(path: string, key: string): string {
  return `${path}${path ? "." : ""}${key}`;
}

function checkObject(
  value: unknown,
  node: SchemaNode,
  path: string,
  errors: string[]
) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push(`${path || "config"} must be an object`);
    return;
  }

  const record = value as Record<string, unknown>;

  // Treat "" as absent: a required field present but blank is a config someone
  // meant to fill in, and shipping it would render an empty brand name.
  for (const key of node.required ?? []) {
    const present = record[key];
    if (present === undefined || present === null || present === "") {
      errors.push(`${join(path, key)} is required`);
    }
  }

  const properties = node.properties ?? {};

  if (node.additionalProperties === false) {
    for (const key of Object.keys(record)) {
      if (!properties[key]) errors.push(`${join(path, key)} is not allowed`);
    }
  }

  for (const [key, subNode] of Object.entries(properties)) {
    if (record[key] !== undefined && record[key] !== null) {
      checkValue(record[key], subNode, join(path, key), errors);
    }
  }
}

function checkString(
  value: unknown,
  node: SchemaNode,
  path: string,
  errors: string[]
) {
  if (typeof value !== "string") {
    errors.push(`${path} must be a string`);
    return;
  }

  if (typeof node.minLength === "number" && value.length < node.minLength) {
    errors.push(`${path} must be at least ${node.minLength} characters`);
  }

  const format = node.format ? FORMATS[node.format] : undefined;
  if (format && !format(value)) {
    errors.push(`${path} is not a valid ${node.format}`);
  }
}

function checkNumber(
  value: unknown,
  node: SchemaNode,
  path: string,
  errors: string[]
) {
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

function checkValue(
  value: unknown,
  node: SchemaNode,
  path: string,
  errors: string[]
) {
  if (node.type === "object") return checkObject(value, node, path, errors);
  if (node.type === "string") return checkString(value, node, path, errors);
  if (node.type === "number") return checkNumber(value, node, path, errors);
}

/** Validate a value against a schema. Returns errors; empty means valid. */
export function checkAgainstSchema(
  value: unknown,
  schema: SchemaNode
): string[] {
  const errors: string[] = [];
  checkValue(value, schema, "", errors);
  return errors;
}
