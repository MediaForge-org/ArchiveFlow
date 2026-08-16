import type { PaginationCursor } from "./pagination";

/**
 * Discovery DTOs are the raw, source-neutral shapes an adapter reports
 * *before* anything is written into the archive's own aggregates
 * (`SourceAccount`, `ContentItem`, ... in `@archiveflow/core`). Discovery is
 * deliberately separate from acquisition — metadata-only and dry-run flows
 * must be possible (Architecture Guardrail: "Discovery ≠ Acquisition").
 *
 * `sourceAccountId` / `sourceContentId` are the *source's own* stable ids,
 * kept separate from ArchiveFlow's internal `af_*` ids, which are assigned
 * later when core maps a discovery result into an aggregate.
 */
export interface DiscoveredAccount {
  readonly sourceAccountId: string;
  readonly username: string;
  readonly displayName?: string;
}

export interface DiscoveredContentItem {
  readonly sourceContentId: string;
  readonly sourceAccountId: string;
  readonly publishedAt: string;
  /** Number of media candidates this content item resolves to (e.g. carousel size). */
  readonly mediaCount: number;
}

export interface DiscoverAccountParams {
  readonly usernameOrId: string;
}

export interface DiscoverContentParams {
  readonly sourceAccountId: string;
  readonly cursor?: PaginationCursor;
}
