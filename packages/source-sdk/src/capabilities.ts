/**
 * Granular capabilities a source may support. UI and core code branch on
 * these, never on `manifest.id` (Architecture Guardrail: "UI-Regel" /
 * "Source SDK + Capabilities"). Not every source supports every capability;
 * missing capabilities are `false`/absent, never an error.
 */
export type Capability =
  | "posts"
  | "short_video"
  | "stories"
  | "highlights"
  | "comments"
  | "saved"
  | "following"
  | "playlists";

export type SourceCapabilities = Readonly<Partial<Record<Capability, boolean>>>;

export function hasCapability(capabilities: SourceCapabilities, capability: Capability): boolean {
  return capabilities[capability] === true;
}
