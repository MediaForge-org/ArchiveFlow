import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * A source-neutral publication/unit (post, video, gallery, ...). The actual
 * media it consists of is linked via `MediaReference`s (1..n — carousels and
 * galleries are content items with multiple references), never embedded
 * here (Architecture Guardrail: "Multi-Asset-Content").
 */
export type ContentItemStatus =
  | "discovered"
  | "acquired"
  /** Remote content that disappeared upstream is kept locally, not deleted. */
  | "missing_remote";

export interface ContentItem {
  readonly id: ArchiveFlowId<"content_item">;
  readonly sourceAccountId: ArchiveFlowId<"source_account">;
  /** The source's own id for this content, kept separate from `id`. */
  readonly sourceContentId: string;
  readonly status: ContentItemStatus;
  readonly publishedAt: string;
  readonly discoveredAt: string;
}
