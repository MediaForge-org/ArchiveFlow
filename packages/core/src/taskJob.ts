import type { ArchiveFlowId } from "@archiveflow/media-model";

/**
 * Mirrors the shape of `af_task_engine::TaskJob` (Rust) on the TypeScript
 * side for UI consumption. Download is just one task kind among many
 * (Architecture Guardrail: "Generische Task Engine").
 */
export type TaskKind =
  | "discover_account"
  | "discover_content"
  | "resolve_media"
  | "download_media"
  | "verify_media"
  | "hash_media"
  | "generate_thumbnail"
  | "sync"
  | "backup"
  | "restore"
  | "reindex"
  | "migrate"
  | "import"
  | "export"
  | "health_check";

export type TaskStatus =
  "pending" | "blocked" | "running" | "paused" | "failed" | "completed" | "cancelled";

export interface TaskJob {
  readonly id: ArchiveFlowId<"task_job">;
  readonly kind: TaskKind;
  readonly status: TaskStatus;
  readonly dependsOn: readonly ArchiveFlowId<"task_job">[];
}
