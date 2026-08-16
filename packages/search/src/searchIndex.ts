import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * Source-neutral search contract. Any indexable document — regardless of
 * which source it originated from — is just an id plus searchable text and
 * facet fields. Persistence/full-text-index backend is a later package;
 * this fixes the shape so callers can depend on it now.
 */
export interface SearchDocument {
  readonly id: ArchiveFlowId;
  readonly text: string;
  readonly facets: Readonly<Record<string, string>>;
}

export interface SearchQuery {
  readonly text?: string;
  readonly facets?: Readonly<Record<string, string>>;
  readonly limit?: number;
}

export interface SearchResult {
  readonly id: ArchiveFlowId;
  readonly score: number;
}

export interface SearchIndex {
  index(document: SearchDocument): void;
  remove(id: ArchiveFlowId): void;
  search(query: SearchQuery): readonly SearchResult[];
}
