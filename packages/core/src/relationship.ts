import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * Generic typed link between two ArchiveFlow entities. Cross-source dedup
 * relies on relationships like this to keep every source's reference to a
 * shared `MediaAsset` intact, even after physical dedup (Architecture
 * Guardrail: "Cross-Source Dedup" — "Niemals Source-Beziehungen verlieren").
 */
export type RelationshipKind = "archive_identity_link" | "duplicate_of";

export interface Relationship {
  readonly id: string;
  readonly kind: RelationshipKind;
  readonly fromId: ArchiveFlowId;
  readonly toId: ArchiveFlowId;
  readonly createdAt: string;
}
