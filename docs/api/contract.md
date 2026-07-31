# API Contract

## API Rules

The frontend consumes a **Laravel JSON:API** backend. Treat the backend API as an external contract and never infer or modify its behavior based solely on frontend requirements.

The API follows the **JSON:API 1.1** specification and is implemented using
**API Platform for Laravel 4.3**.

Primary references:

- JSON:API Specification 1.1
- API Platform documentation: `https://api-platform.com/docs/`

Use both specifications as the authoritative reference for:

- Resource documents
- Relationships
- Included resources
- Links
- Meta
- Errors
- Pagination
- Filtering
- Sorting
- Sparse fieldsets
- Content negotiation

---

## Backend Source of Truth

The backend implementation lives in the **Vendra** repository:

- `https://github.com/misaf/vendra`

When frontend work depends on backend behavior:

1. Inspect the existing frontend API layer first.
2. Reuse existing API clients, queries, and mappers whenever possible.
3. If backend behavior is unclear, verify it in the Vendra repository.
4. Treat backend resources, serializers, routes, schemas, and validation rules as the source of truth.

Never guess backend behavior from UI requirements.
