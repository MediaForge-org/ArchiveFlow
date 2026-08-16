import { SourceRegistry } from "@archiveflow/core";
import { SourceError } from "@archiveflow/source-sdk";
import { describe, expect, it } from "vitest";

import { instagramAdapter } from "../adapter";
import { instagramManifest } from "../manifest";

describe("instagram source scaffold", () => {
  it("declares a manifest with a semver adapterApiVersion", () => {
    expect(instagramManifest.id).toBe("instagram");
    expect(instagramManifest.adapterApiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("registers into the generic core SourceRegistry unchanged", () => {
    const registry = new SourceRegistry();
    registry.register(instagramAdapter);
    expect(registry.get("instagram")).toBe(instagramAdapter);
  });

  it("fails fast with a stable, typed error instead of pretending to fetch real data", async () => {
    await expect(
      instagramAdapter.discoverAccount({ usernameOrId: "someone" }),
    ).rejects.toBeInstanceOf(SourceError);
  });

  it("reports itself as down, not ok, while unimplemented", async () => {
    const health = await instagramAdapter.health();
    expect(health.state).toBe("down");
  });
});
