import type { ArchiveFlowId } from "./ids";
import type { MediaCandidateKind } from "./mediaCandidate";

/**
 * `MediaAsset` is the logical media identity: "this picture/video", decoupled
 * from any single source reference to it and from where it is physically
 * stored (Architecture Guardrail: "Logisch vs. physisch trennen"). Multiple
 * `MediaReference`s (possibly from different sources) may point at the same
 * `MediaAsset` once cross-source dedup identifies them as the same content.
 */
export interface MediaAsset {
  readonly id: ArchiveFlowId<"media_asset">;
  readonly kind: MediaCandidateKind;
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly durationMs?: number;
  /** The `PhysicalBlob` currently backing this asset's bytes on disk. */
  readonly physicalBlobId: ArchiveFlowId<"physical_blob">;
  readonly createdAt: string;
}
