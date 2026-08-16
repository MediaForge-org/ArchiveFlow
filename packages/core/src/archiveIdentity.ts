import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * Optional, local, manually-curated grouping of `SourceAccount`s that a user
 * believes belong to the same person/entity across sources. ArchiveFlow
 * never infers or asserts this automatically (Architecture Guardrail:
 * "ArchiveIdentity ... keine automatische Identitätsbehauptung").
 */
export interface ArchiveIdentity {
  readonly id: ArchiveFlowId<"archive_identity">;
  readonly label: string;
  readonly linkedSourceAccountIds: readonly ArchiveFlowId<"source_account">[];
  readonly createdAt: string;
}
