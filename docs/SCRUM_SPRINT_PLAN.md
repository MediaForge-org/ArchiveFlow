# Scrum / Sprint-Vorschlag

Die Pakete sind klein genug, dass mehrere in einen Sprint passen. Ziel bleibt: **am Sprintende ein funktionierendes, testbares Inkrement**.

- Sprint 0: P001–P010 — Foundation und grüne CI.
- Sprint 1: P011–P014 — erster echter Post/Reel/Carousel-Download.
- Sprint 2: P015–P020 — Stories, Highlights, Saved, Profile, Following, Quality Resolver.
- Sprint 3: P021–P024 — Metadaten, Dateinamen, robuster Writer, Verifikation.
- Sprint 4: P025–P030 — Scan, Planner, Queue, Retry.
- Sprint 5: P031–P035 — Crash Recovery und echte Bulk-Archivierung.
- Sprint 6: P036–P039 — Inkrementeller Sync und Account-Lifecycle.
- Sprint 7: P040–P044 — Explorer, Viewer, Suche.
- Sprint 8: P045–P049 — Accountansicht, Stories/Highlights, Collections, Dedupe, Repair.
- Sprint 9: P050–P054 — Storage, Migration, Backup, Settings, Ressourcensteuerung.
- Sprint 10+: P055–P060 — v1.x Library/Automation/Adapter-Funktionen.
- Release Sprint: P061–P067 — Browser UX, Onboarding, Last, Security, Packaging, v1.0 Gate.
- Danach: P068–P070 — Roadmap/optionale Erweiterungen.

Innerhalb eines Sprints trotzdem **ein Branch pro Paket**. Merge erst nach lokal grünen Tests und grüner CI.


## Multi-Source Architecture Track

Diese Pakete werden nach dem stabilen Instagram-v1.x-Core umgesetzt, **während ihre Architektur-Grenzen bereits ab P001/P002 verbindlich sind**.

- P071: Cross-Source Deduplizierung
- P072: ArchiveIdentity + Content Graph
- P073: Source Manager + Adapter Health
- P074: Portables ArchiveFlow Format
- P075: Source Worker Isolation
- P076: Command Palette + Saved Views
- P077: Audit Log + Provenance Browser
- P078: Unified Search/Library
- P079: Feature Flags + UI Slots
- P080: Second-Source Conformance Proof
