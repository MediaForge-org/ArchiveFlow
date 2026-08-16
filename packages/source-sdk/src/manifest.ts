/**
 * Identity of a source adapter. `adapterApiVersion` is the contract version
 * this adapter was built against (Architecture Guardrail: "Versionierung &
 * Tests" — adapter contracts are versioned).
 */
export interface SourceManifest {
  /** Stable, lowercase, machine-readable source id, e.g. "instagram". Not a display label. */
  readonly id: string;
  readonly displayName: string;
  /** Semver of the `@archiveflow/source-sdk` contract shape this adapter targets. */
  readonly adapterApiVersion: string;
}
