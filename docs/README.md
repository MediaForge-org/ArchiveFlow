# ArchiveFlow — Social Media Archive Manager — Prompt Pack

Dieses ZIP enthält **80 getrennte Implementierungsprompts**. Jeder Prompt ist genau **ein Scrum-Arbeitspaket** und soll einzeln an Claude oder Codex gegeben werden.

## Benutzung

1. Beginne mit P001 und arbeite Abhängigkeiten in Reihenfolge ab.
2. Pro Paket einen eigenen Git-Branch verwenden.
3. Erst nach grünen Tests/CI und Review nach `main` mergen.
4. Danach das nächste Paket starten.
5. Die Prompts sind absichtlich eigenständig und wiederholen die wichtigsten Produktinvarianten, damit ein Agent nicht auf versteckten Kontext angewiesen ist.

## Produktkern

- Tauri-Desktop-App ist das Hauptprodukt.
- MV3-Browser-Extension ist der Instagram Companion.
- Rust übernimmt robuste Downloads/Dateisystem/Queue/Verifikation.
- React/TypeScript übernimmt Desktop- und Extension-UI.
- SQLite hält Accounts, Medien, Queue, Syncs, Historie und Settings.
- Maximale verfügbare Qualität ist Standard.
- Default-Dateiname enthält Username + Instagram-Uploaddatum.
- Carousels/Slideshows vollständig unterstützt.
- Planner analysiert Anzahl und Speicherbedarf vor großen Downloads.
- Alle ausgewählten Followings können archiviert und später inkrementell synchronisiert werden.
- Integrierter Explorer mit Grid/List/Viewer/Search/Filter/Collections.

## Phasen

- `00-foundation`: Architektur, Shells, IPC, DB, Tests, CI.
- `01-instagram-adapter`: Session, Medienarten, Quality, Metadaten, Writer, Verify.
- `02-planner-queue`: Analyse, Planner, Queue, Retry, Crash-Recovery.
- `03-bulk-sync`: Profil-/Following-Archivierung und inkrementeller Sync.
- `04-library-explorer`: Medienbibliothek, Viewer, Suche, Collections, Reparatur.
- `05-storage-settings`: Storage, Migration, Backup, Presets, Ressourcensteuerung.
- `06-advanced-v1x`: Kalender, Statistik, Smart Collections, Watch Folders, Scheduler, weitere Adapter.
- `07-extension-release`: Browser-UX, Onboarding, Performance, Security, Packaging, v1.0 Gate.
- `08-roadmap`: v1.x Planung und optionale Erweiterungen.

Siehe `PACKAGE_INDEX.md` für die vollständige Reihenfolge.


## Pflichtlektüre vor P001

Lies `ARCHITECTURE_GUARDRAILS.md`. Die Source-neutrale Architektur ist kein späteres Refactoring, sondern ab dem ersten Paket verbindlich. Instagram ist nur die erste produktive Source.

## Neue UI-Referenzen

Die Multi-Source- und Core-Mockups `UI-093` bis `UI-128` liegen einzeln unter `UI_Mockups/02_multisource_architecture/`.
