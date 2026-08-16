import type { MediaCandidate } from "@archiveflow/media-model";

import type { SessionState } from "./auth";
import type { SourceCapabilities } from "./capabilities";
import type { CancellationToken } from "./cancellation";
import type {
  DiscoverAccountParams,
  DiscoverContentParams,
  DiscoveredAccount,
  DiscoveredContentItem,
} from "./discovery";
import type { HealthDiagnostics } from "./health";
import type { SourceManifest } from "./manifest";
import type { NormalizedMetadata } from "./metadata";
import type { Page } from "./pagination";
import type { RatePolicyHint } from "./ratePolicy";

export interface ResolveMediaCandidatesParams {
  readonly sourceContentId: string;
  readonly cancellationToken?: CancellationToken;
}

/**
 * The full contract every source adapter implements. Registering a new
 * adapter must never require changing this interface or any core
 * consumer of it (Architecture Guardrail review question: "Würde dieser
 * Code unverändert funktionieren, wenn morgen ein zweiter Source-Adapter
 * registriert wird?").
 */
export interface SourceAdapter {
  readonly manifest: SourceManifest;

  capabilities(): SourceCapabilities;

  getSessionState(): SessionState;

  discoverAccount(params: DiscoverAccountParams): Promise<DiscoveredAccount>;

  discoverContent(params: DiscoverContentParams): Promise<Page<DiscoveredContentItem>>;

  resolveMediaCandidates(params: ResolveMediaCandidatesParams): Promise<readonly MediaCandidate[]>;

  normalizeMetadata(sourceContentId: string): Promise<NormalizedMetadata>;

  ratePolicyHint(): RatePolicyHint;

  health(): Promise<HealthDiagnostics>;
}
