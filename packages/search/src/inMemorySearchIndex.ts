import type { ArchiveFlowId } from "@archiveflow/media-model";

import type { SearchDocument, SearchIndex, SearchQuery, SearchResult } from "./searchIndex";

/**
 * Pure in-memory reference implementation of `SearchIndex`. Useful for unit
 * tests and as the default until a persistent full-text backend lands; not
 * meant to scale to a real archive by itself.
 */
export class InMemorySearchIndex implements SearchIndex {
  private readonly documentsById = new Map<ArchiveFlowId, SearchDocument>();

  index(document: SearchDocument): void {
    this.documentsById.set(document.id, document);
  }

  remove(id: ArchiveFlowId): void {
    this.documentsById.delete(id);
  }

  search(query: SearchQuery): readonly SearchResult[] {
    const needle = query.text?.trim().toLowerCase();
    const limit = query.limit ?? Number.POSITIVE_INFINITY;

    const results: SearchResult[] = [];
    for (const doc of this.documentsById.values()) {
      if (!matchesFacets(doc, query.facets)) continue;

      const score = needle ? scoreText(doc.text, needle) : 1;
      if (score > 0) {
        results.push({ id: doc.id, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}

function matchesFacets(
  doc: SearchDocument,
  facets: Readonly<Record<string, string>> | undefined,
): boolean {
  if (!facets) return true;
  return Object.entries(facets).every(([key, value]) => doc.facets[key] === value);
}

function scoreText(haystack: string, needle: string): number {
  return haystack.toLowerCase().includes(needle) ? 1 : 0;
}
