/**
 * ArchiveFlow-internal identifiers are namespaced `af_<entity>_<opaque>`
 * strings, independent of any source id, username or file path
 * (Architecture Guardrail: "ArchiveFlow-IDs"). This module is the single
 * place both `core` and `media-model` types anchor their id shape to, so it
 * must never gain a dependency on a specific source.
 */

/** Entity kinds an `ArchiveFlowId` can be namespaced to. Purely structural. */
export type EntityKind =
  | "source_account"
  | "archive_identity"
  | "content_item"
  | "media_reference"
  | "media_asset"
  | "physical_blob"
  | "task_job";

/** Branded string so ids of different entity kinds are not interchangeable. */
export type ArchiveFlowId<Kind extends EntityKind = EntityKind> = string & {
  readonly __archiveFlowIdKind: Kind;
};

const ID_PATTERN = /^af_([a-z_]+)_([a-zA-Z0-9-]+)$/;

const ENTITY_PREFIXES: Record<EntityKind, string> = {
  source_account: "sacc",
  archive_identity: "aid",
  content_item: "item",
  media_reference: "mref",
  media_asset: "asset",
  physical_blob: "blob",
  task_job: "task",
};

export function createArchiveFlowId<Kind extends EntityKind>(
  kind: Kind,
  opaqueSuffix: string,
): ArchiveFlowId<Kind> {
  if (opaqueSuffix.length === 0) {
    throw new Error("createArchiveFlowId: opaqueSuffix must not be empty");
  }
  return `af_${ENTITY_PREFIXES[kind]}_${opaqueSuffix}` as ArchiveFlowId<Kind>;
}

export function isArchiveFlowId(value: string): value is ArchiveFlowId {
  const match = ID_PATTERN.exec(value);
  if (!match) return false;
  const prefix = match[1];
  return Object.values(ENTITY_PREFIXES).includes(prefix ?? "");
}

export function entityKindOf(id: ArchiveFlowId): EntityKind | undefined {
  const match = ID_PATTERN.exec(id);
  const prefix = match?.[1];
  if (!prefix) return undefined;
  const entry = (Object.entries(ENTITY_PREFIXES) as [EntityKind, string][]).find(
    ([, value]) => value === prefix,
  );
  return entry?.[0];
}
