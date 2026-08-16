import type { ArchiveFlowId } from "./ids";

/**
 * `PhysicalBlob` is the actually-stored file: content hash, size and storage
 * location. Never held as bytes in SQLite (Architecture Guardrail:
 * "Local-first" — DB holds metadata/relations, not media blobs). File paths
 * are storage locations, never identity; several `MediaAsset`s could in
 * principle share a blob once dedup lands, but each blob is stored once.
 */
export interface PhysicalBlob {
  readonly id: ArchiveFlowId<"physical_blob">;
  /** Lowercase-hex SHA-256 of the file contents. */
  readonly contentHash: string;
  readonly sizeBytes: number;
  /** Storage-relative path (not an absolute filesystem path — those can change). */
  readonly storageRelativePath: string;
  readonly createdAt: string;
}
