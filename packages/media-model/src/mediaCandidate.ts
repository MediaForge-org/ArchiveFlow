/**
 * A `MediaCandidate` is a source-neutral description of one downloadable
 * variant of a piece of media, as resolved (but not yet fetched) from a
 * source. Discovery/resolution is intentionally separate from acquisition
 * (Architecture Guardrail: "Discovery ≠ Acquisition").
 *
 * Sources may expose multiple candidates per media item (resolutions,
 * bitrates, formats); which one is "best" is a selection concern for the
 * adapter/task engine, not modeled here.
 */
export type MediaCandidateKind = "image" | "video" | "audio";

export interface MediaCandidate {
  /** Opaque, source-defined identifier for this candidate, for dedup/logging. */
  readonly candidateId: string;
  readonly kind: MediaCandidateKind;
  /** Container/mime hint, e.g. "image/jpeg". Optional: not all sources expose it pre-download. */
  readonly mimeType?: string;
  readonly widthPx?: number;
  readonly heightPx?: number;
  /** Bytes, if known ahead of download (used by preflight size estimation). */
  readonly sizeBytes?: number;
  /** Free-form, source-defined quality label (e.g. "1080p", "original"). Not a ranking. */
  readonly qualityLabel?: string;
}
