import { describe, expect, it } from "vitest";

import { createArchiveFlowId, entityKindOf, isArchiveFlowId } from "../ids";

describe("createArchiveFlowId", () => {
  it("namespaces ids per entity kind", () => {
    expect(createArchiveFlowId("content_item", "abc123")).toBe("af_item_abc123");
    expect(createArchiveFlowId("physical_blob", "deadbeef")).toBe("af_blob_deadbeef");
  });

  it("rejects an empty opaque suffix", () => {
    expect(() => createArchiveFlowId("content_item", "")).toThrow();
  });
});

describe("isArchiveFlowId", () => {
  it("accepts well-formed ids", () => {
    expect(isArchiveFlowId("af_item_abc123")).toBe(true);
  });

  it("rejects ids without the af_ namespace", () => {
    expect(isArchiveFlowId("item_abc123")).toBe(false);
  });

  it("rejects an unknown / source-flavoured entity prefix", () => {
    // "ig_" would be an Instagram-specific prefix leaking into a supposedly
    // source-neutral id — must never validate.
    expect(isArchiveFlowId("af_ig_abc123")).toBe(false);
  });
});

describe("entityKindOf", () => {
  it("recovers the entity kind from a valid id", () => {
    const id = createArchiveFlowId("source_account", "xyz");
    expect(entityKindOf(id)).toBe("source_account");
  });
});
