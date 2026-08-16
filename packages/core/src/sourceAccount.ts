import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * An account on exactly one source, identified by that source's own stable
 * id — never by username, which can change (Architecture Guardrail:
 * "Account-Identität").
 */
export interface UsernameHistoryEntry {
  readonly username: string;
  readonly observedAt: string;
}

export interface SourceAccount {
  readonly id: ArchiveFlowId<"source_account">;
  readonly sourceId: string;
  /** The source's own stable account id, kept separate from `id`. */
  readonly sourceAccountId: string;
  readonly usernameHistory: readonly UsernameHistoryEntry[];
  readonly createdAt: string;
}
