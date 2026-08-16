import type { SourceAdapter } from "@archiveflow/source-sdk";
import { describe, expect, it } from "vitest";

import { SourceRegistry, SourceRegistryError } from "../sourceRegistry";

/**
 * A minimal, generic dummy adapter — not Instagram, not any real source.
 * Registering it below without touching any other file in `core` is the
 * proof for the P001 acceptance criterion: "Ein leerer Dummy-Source-Manifest
 * kann registriert werden, ohne Core-Code zu ändern."
 */
function createDummyAdapter(id: string): SourceAdapter {
  return {
    manifest: { id, displayName: "Dummy", adapterApiVersion: "0.1.0" },
    capabilities: () => ({}),
    getSessionState: () => ({ kind: "unauthenticated" }),
    discoverAccount: async (params) => ({
      sourceAccountId: params.usernameOrId,
      username: params.usernameOrId,
    }),
    discoverContent: async () => ({ items: [] }),
    resolveMediaCandidates: async () => [],
    normalizeMetadata: async () => ({
      core: { publishedAt: new Date(0).toISOString() },
      source: {},
    }),
    ratePolicyHint: () => ({}),
    health: async () => ({ state: "ok", checkedAt: new Date(0).toISOString() }),
  };
}

describe("SourceRegistry", () => {
  it("registers and looks up a brand-new, generic dummy source with no core changes", () => {
    const registry = new SourceRegistry();
    registry.register(createDummyAdapter("dummy-one"));

    expect(registry.get("dummy-one")?.manifest.id).toBe("dummy-one");
    expect(registry.list()).toHaveLength(1);
  });

  it("supports registering a second, independent source alongside the first", () => {
    const registry = new SourceRegistry();
    registry.register(createDummyAdapter("dummy-one"));
    registry.register(createDummyAdapter("dummy-two"));

    expect(
      registry
        .list()
        .map((a) => a.manifest.id)
        .sort(),
    ).toEqual(["dummy-one", "dummy-two"]);
  });

  it("rejects registering two adapters under the same source id", () => {
    const registry = new SourceRegistry();
    registry.register(createDummyAdapter("dummy-one"));

    expect(() => registry.register(createDummyAdapter("dummy-one"))).toThrow(SourceRegistryError);
  });

  it("returns undefined for an unregistered source id instead of throwing", () => {
    const registry = new SourceRegistry();
    expect(registry.get("unknown")).toBeUndefined();
  });
});
