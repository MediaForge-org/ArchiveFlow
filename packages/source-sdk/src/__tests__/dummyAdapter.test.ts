import { describe, expect, it } from "vitest";

import type { SourceAdapter } from "../adapter";

/**
 * A fully generic, non-Instagram dummy adapter. Its only purpose is to
 * prove the `SourceAdapter` contract is implementable end to end by a
 * second, unrelated source without any change to this package.
 */
function createDummyAdapter(): SourceAdapter {
  return {
    manifest: { id: "dummy", displayName: "Dummy Source", adapterApiVersion: "0.1.0" },
    capabilities: () => ({ posts: true }),
    getSessionState: () => ({ kind: "unauthenticated" }),
    async discoverAccount(params) {
      return { sourceAccountId: `dummy-${params.usernameOrId}`, username: params.usernameOrId };
    },
    async discoverContent() {
      return { items: [] };
    },
    async resolveMediaCandidates() {
      return [];
    },
    async normalizeMetadata() {
      return { core: { publishedAt: new Date(0).toISOString() }, source: {} };
    },
    ratePolicyHint: () => ({ maxRequestsPerMinute: 30 }),
    async health() {
      return { state: "ok", checkedAt: new Date(0).toISOString() };
    },
  };
}

describe("SourceAdapter contract", () => {
  it("is implementable by a second, generic source with no core/source-sdk changes", async () => {
    const adapter = createDummyAdapter();

    expect(adapter.manifest.id).toBe("dummy");
    expect(adapter.capabilities().posts).toBe(true);
    expect(adapter.getSessionState().kind).toBe("unauthenticated");

    const account = await adapter.discoverAccount({ usernameOrId: "someone" });
    expect(account.sourceAccountId).toBe("dummy-someone");

    const page = await adapter.discoverContent({ sourceAccountId: account.sourceAccountId });
    expect(page.items).toEqual([]);

    await expect(adapter.health()).resolves.toMatchObject({ state: "ok" });
  });
});
