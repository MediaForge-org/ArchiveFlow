import type { ArchiveFlowId } from "@archiveflow/media-model";
import { beforeEach, describe, expect, it } from "vitest";

import { InMemorySearchIndex } from "../inMemorySearchIndex";

const idA = "af_item_a" as ArchiveFlowId;
const idB = "af_item_b" as ArchiveFlowId;

describe("InMemorySearchIndex", () => {
  let index: InMemorySearchIndex;

  beforeEach(() => {
    index = new InMemorySearchIndex();
    index.index({ id: idA, text: "sunset over the beach", facets: { source: "instagram" } });
    index.index({ id: idB, text: "mountain hike photos", facets: { source: "reddit" } });
  });

  it("finds documents by case-insensitive substring match", () => {
    const results = index.search({ text: "SUNSET" });
    expect(results.map((r) => r.id)).toEqual([idA]);
  });

  it("filters by facets independent of which source produced the document", () => {
    const results = index.search({ facets: { source: "reddit" } });
    expect(results.map((r) => r.id)).toEqual([idB]);
  });

  it("returns no results for a query that matches nothing", () => {
    expect(index.search({ text: "nonexistent" })).toEqual([]);
  });

  it("stops returning a document once it has been removed", () => {
    index.remove(idA);
    expect(index.search({ text: "sunset" })).toEqual([]);
  });

  it("respects the requested result limit", () => {
    index.index({ id: "af_item_c" as ArchiveFlowId, text: "sunset again", facets: {} });
    const results = index.search({ text: "sunset", limit: 1 });
    expect(results).toHaveLength(1);
  });
});
