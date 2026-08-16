# ArchiveFlow

ArchiveFlow is a **local-first, source-neutral social media archive manager**.
**Instagram is Source #1 — the first fully implemented platform — but it is
not the architecture of the product.** TikTok, X, Reddit, YouTube, Threads
and further sources are meant to be added later as versioned source
adapters, without rewriting the Task Engine, Archive/Database, Library/
Explorer, Search, Storage, Backup or shared UI.

Every architectural decision in this repository is bound by
[`docs/ARCHITECTURE_GUARDRAILS.md`](docs/ARCHITECTURE_GUARDRAILS.md). Read it
before touching `packages/core`, `packages/source-sdk`, or any Rust crate —
it is the review criterion for whether a change belongs in the core or in a
source adapter.

## Repository layout

```text
apps/
  desktop/               Tauri 2 desktop app (Rust backend + React/TS frontend) — the main product.
  extension-instagram/    MV3 browser companion for Instagram — a source-specific companion, not core.
packages/
  core/                   Source-neutral domain model (SourceAccount, ArchiveIdentity, ContentItem, ...) + Source Registry.
  source-sdk/             Versioned contract every source adapter implements. No dependency on any concrete source.
  media-model/            MediaAsset / PhysicalBlob / MediaReference / MediaCandidate + ArchiveFlow id primitives.
  protocol/               Versioned IPC message envelope + stable error DTO shared by desktop, extensions and Tauri commands.
  search/                 Source-neutral search index contract, with a pure in-memory reference implementation.
  ui/                     Shared React UI primitives (loading/empty/error states, buttons). No source-specific components.
sources/
  instagram/              Instagram source adapter (Source #1). Scaffold only in this package — no account/media access yet.
crates/
  task-engine/            Generic persistent task/job DAG primitives. Download is just one task kind.
  archive/                ArchiveFlow id (`af_*`) primitives, source-neutral.
  storage/                Content-addressed physical blob path resolution.
  media-probe/            Source-neutral media technical-property probing contract.
  thumbnail/              Source-neutral thumbnail sizing.
  hashing/                SHA-256 content hashing for PhysicalBlob identity and dedup.
```

Nothing under `packages/core`, `packages/source-sdk`, `packages/search`,
`packages/ui`, `packages/protocol` or the Rust crates may import from or
branch on a specific source (no `if source === "instagram"`). Source-specific
logic lives exclusively in `sources/*` and `apps/extension-*`.

## Toolchain

- **Desktop**: Tauri 2, Rust backend, React + TypeScript frontend (Vite).
- **Browser companion**: TypeScript, React, Chromium Manifest V3.
- **Package manager**: pnpm workspaces (`pnpm-workspace.yaml`).
- **Rust**: Cargo workspace (`Cargo.toml`), `rustfmt`, `clippy`.
- **Tests**: Vitest (TypeScript), `cargo test` (Rust). Playwright for
  end-to-end UI/extension flows lands once there is a UI flow to cover.
- **Lint/format**: ESLint (flat config) and Prettier for TypeScript; `cargo fmt`
  and `cargo clippy` for Rust.

## Getting started

```bash
# Node/TypeScript side
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# Rust side
pnpm rust:fmt:check
pnpm rust:lint
pnpm rust:test
pnpm rust:build

# Run everything CI runs
pnpm check
```

Run the desktop app in development:

```bash
pnpm dev:desktop
```

Run the Instagram browser companion in development:

```bash
pnpm dev:extension-instagram
```

> Building/running the Tauri desktop app's Rust backend (`cargo build` /
> `pnpm tauri dev`) requires the Linux WebKitGTK/GTK development packages
> described at <https://tauri.app/start/prerequisites/>. `packages/*`,
> `sources/*`, `crates/*` and the extension companion have no such system
> dependency.

## Contributing a new source

1. Create `sources/<name>/`, depending only on `@archiveflow/source-sdk`
   (and `@archiveflow/media-model` for shared media types) — never on
   `@archiveflow/core` or another source.
2. Implement the `SourceAdapter` contract from `@archiveflow/source-sdk`
   and declare an honest `capabilities()` set.
3. Register the adapter with `SourceRegistry` from `@archiveflow/core` at
   the app-wiring layer. No change to `packages/core` should be required.
4. Ask the guardrail review question: _"Would this code work unchanged if a
   second source adapter were registered tomorrow?"_
