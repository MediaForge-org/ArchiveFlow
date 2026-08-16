/**
 * Opaque, source-defined pagination cursor. Core code must never parse or
 * construct cursor values — only pass them back to the adapter that issued
 * them.
 */
export type PaginationCursor = string;

export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor?: PaginationCursor;
}
