import type { SourceAdapter } from "@archiveflow/source-sdk";

/**
 * Registers and looks up source adapters by `manifest.id`. This is the only
 * place core touches a `SourceAdapter` — everything else in core reaches a
 * source only through this registry and the `SourceAdapter` contract, never
 * through a source-specific import. Registering a new adapter (e.g. a
 * second, unrelated source) must never require a change in this file
 * (Architecture Guardrail review question).
 */
export class SourceRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceRegistryError";
  }
}

export class SourceRegistry {
  private readonly adaptersById = new Map<string, SourceAdapter>();

  register(adapter: SourceAdapter): void {
    const { id } = adapter.manifest;
    if (this.adaptersById.has(id)) {
      throw new SourceRegistryError(`source "${id}" is already registered`);
    }
    this.adaptersById.set(id, adapter);
  }

  get(sourceId: string): SourceAdapter | undefined {
    return this.adaptersById.get(sourceId);
  }

  list(): readonly SourceAdapter[] {
    return [...this.adaptersById.values()];
  }
}
