#!/usr/bin/env node
/**
 * Minimal JSON Schema (draft-07 subset) validator for property.config.json.
 *
 * The schema is the single source of truth: `properties/schema.json`. This
 * module only interprets the subset of JSON Schema the file uses (type checks,
 * required fields, additionalProperties: false, string minLength/format, and
 * numeric bounds) so that build-time validation and the runtime check in
 * `src/shared/property/validation.ts` agree without maintaining field lists by
 * hand.
 */

const FORMATS = {
  uri: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email: (value) => typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
};

function checkValue(value, node, path, errors) {
  if (node.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${path} must be an object`);
      return;
    }

    if (Array.isArray(node.required)) {
      for (const key of node.required) {
        if (value[key] === undefined || value[key] === null || value[key] === "") {
          errors.push(`${path}${path ? "." : ""}${key} is required`);
        }
      }
    }

    const properties = node.properties || {};
    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!properties[key]) {
          errors.push(`${path}${path ? "." : ""}${key} is not allowed`);
        }
      }
    }

    for (const [key, subNode] of Object.entries(properties)) {
      if (value[key] !== undefined && value[key] !== null) {
        checkValue(value[key], subNode, `${path}${path ? "." : ""}${key}`, errors);
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
    if (node.format && FORMATS[node.format]) {
      if (!FORMATS[node.format](value)) {
        errors.push(`${path} is not a valid ${node.format}`);
      }
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
    if (typeof node.exclusiveMinimum === "number" && value <= node.exclusiveMinimum) {
      errors.push(`${path} must be > ${node.exclusiveMinimum}`);
    }
  }
}

/**
 * Validate a parsed property config against the schema. Returns an array of
 * human-readable errors (empty when valid).
 */
export function validatePropertyConfig(config, schema) {
  const errors = [];
  checkValue(config, schema, "", errors);
  return errors;
}
