/**
 * Metadata layering an adapter must respect when reporting content
 * (Architecture Guardrail: "Metadata Layers"):
 * - `core`: source-neutral fields every source can populate.
 * - `source`: namespaced under the source id, source-specific fields.
 * - `raw`: optional, opaque, diagnostic/reconstructive — not parsed by core.
 *
 * `user_metadata` (tags/rating/favorites) is not part of this shape: it is
 * owned by the archive, never written by an adapter.
 */
export interface CoreMetadata {
  readonly caption?: string;
  readonly publishedAt: string;
  readonly language?: string;
}

export interface NormalizedMetadata {
  readonly core: CoreMetadata;
  /** Namespaced under the source id so two sources' fields can never collide. */
  readonly source: Readonly<Record<string, unknown>>;
  /** Optional compressed/opaque raw payload for later reconstruction, never parsed by core. */
  readonly raw?: Uint8Array;
}
