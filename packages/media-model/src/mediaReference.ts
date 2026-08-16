import type { ArchiveFlowId } from "./ids";

/**
 * `MediaReference` links a `ContentItem` (defined in `@archiveflow/core`) to
 * a `MediaAsset`, carrying the ordering/role that is specific to that
 * content item — e.g. slide 2 of a carousel, or the cover frame of a video.
 * `contentItemId` is referenced by id only so this package never depends on
 * `@archiveflow/core` (core depends on media-model, not the other way).
 */
export type MediaReferenceRole = "primary" | "cover" | "attachment";

export interface MediaReference {
  readonly id: ArchiveFlowId<"media_reference">;
  readonly contentItemId: ArchiveFlowId<"content_item">;
  readonly mediaAssetId: ArchiveFlowId<"media_asset">;
  readonly role: MediaReferenceRole;
  /** 0-based position within the content item's media sequence (carousels/galleries). */
  readonly order: number;
}
