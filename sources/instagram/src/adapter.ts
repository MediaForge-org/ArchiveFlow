import { SourceError, type SourceAdapter } from "@archiveflow/source-sdk";

import { instagramManifest } from "./manifest";

/**
 * Scaffold only — this package is P001 (monorepo/toolchain foundation).
 * Session handling, discovery, media resolution and metadata parsing are
 * out of scope here and land in the `01-instagram-adapter` phase. Every
 * method fails fast with a stable `SourceError` rather than silently
 * pretending to work, so nothing downstream can accidentally depend on
 * unimplemented behavior.
 */
function notImplemented(operation: string): never {
  throw new SourceError(
    "UNSUPPORTED_CAPABILITY",
    `instagram adapter: ${operation} not implemented yet`,
  );
}

export const instagramAdapter: SourceAdapter = {
  manifest: instagramManifest,

  capabilities: () => ({}),

  getSessionState: () => ({ kind: "unauthenticated" }),

  discoverAccount: async () => notImplemented("discoverAccount"),

  discoverContent: async () => notImplemented("discoverContent"),

  resolveMediaCandidates: async () => notImplemented("resolveMediaCandidates"),

  normalizeMetadata: async () => notImplemented("normalizeMetadata"),

  ratePolicyHint: () => ({}),

  health: async () => ({
    state: "down",
    checkedAt: new Date().toISOString(),
    detail: "adapter not implemented yet",
  }),
};
