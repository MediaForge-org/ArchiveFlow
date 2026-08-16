import { describe, expect, it } from "vitest";

import { hasCapability, type SourceCapabilities } from "../capabilities";

describe("hasCapability", () => {
  it("reports true only for capabilities explicitly declared true", () => {
    const capabilities: SourceCapabilities = { posts: true, stories: false };
    expect(hasCapability(capabilities, "posts")).toBe(true);
    expect(hasCapability(capabilities, "stories")).toBe(false);
  });

  it("treats an absent capability as unsupported, not an error", () => {
    const capabilities: SourceCapabilities = {};
    expect(hasCapability(capabilities, "playlists")).toBe(false);
  });
});
