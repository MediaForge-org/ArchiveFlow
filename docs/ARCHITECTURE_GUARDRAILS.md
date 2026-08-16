# ArchiveFlow Architecture Guardrails

Diese Datei ist **verbindlicher Kontext für jedes Arbeitspaket**. Instagram ist die erste Source, aber ArchiveFlow wird als plattformübergreifender Social Media Archive Manager gebaut. TikTok, X, Reddit, YouTube, Threads und weitere Quellen sollen später über neue Adapter ergänzt werden können, ohne bestehende Core-Subsysteme grundsätzlich umzuschreiben.

## Zielarchitektur

```text
ArchiveFlow Desktop
├── Core / Domain
├── Source SDK + Source Registry
├── Task Engine + Scheduler
├── Archive / Database
├── Library / Explorer / Viewer
├── Search / Saved Views / Collections
├── Verification / Hashing / Media Probe / Thumbnail Service
├── Storage / Migration / Backup / Restore
├── Import / Export
├── Audit / Diagnostics / Health
└── Source Adapters
    ├── Instagram
    ├── TikTok (später)
    ├── X (später)
    ├── Reddit (später)
    ├── YouTube (später)
    └── ...
```

## Source SDK

Jeder Source-Adapter implementiert stabile, versionierte Verträge. Mindestens vorzusehen:
- Source identity / manifest / adapterApiVersion
- capabilities()
- auth/session state
- discover account/content
- pagination cursors
- resolve media candidates
- normalize metadata
- source policy / rate control hints
- stable error mapping
- cancellation
- health diagnostics

Nicht jede Source unterstützt jede Capability. Fehlende Capabilities sind normal und werden in UI/Core als `unsupported`, nicht als Fehler behandelt.

## Unified Domain Model

```text
ArchiveIdentity (optional, user-linked)
      │
      └── SourceAccount
              │
              └── ContentItem
                     │
                     └── MediaReference
                            │
                            └── MediaAsset
                                   │
                                   └── PhysicalBlob
```

- `SourceAccount`: Account auf genau einer Source.
- `ArchiveIdentity`: optionale lokale Gruppierung mehrerer SourceAccounts; keine automatische Identitätsbehauptung.
- `ContentItem`: source-neutrale Veröffentlichung/Einheit.
- `MediaReference`: Beziehung eines ContentItems zu einem Asset inkl. Reihenfolge/Role.
- `MediaAsset`: logische Medienidentität und technische Eigenschaften.
- `PhysicalBlob`: tatsächlich gespeicherte Datei/Hash/Storage-Locations.

## Task Engine

Der Scheduler verwaltet generische persistente Tasks und Dependencies. Download ist nur ein Task-Typ. Beispiel:

```text
DISCOVER_ACCOUNT
  -> DISCOVER_CONTENT
  -> RESOLVE_MEDIA
  -> DOWNLOAD_MEDIA
  -> VERIFY_MEDIA
  -> HASH_MEDIA
  -> GENERATE_THUMBNAIL
  -> COMPLETE
```

Zusätzliche Tasks: SYNC, BACKUP, RESTORE, REINDEX, MIGRATE, IMPORT, EXPORT, HEALTH_CHECK.

## Metadata Layers

- `core_metadata`: source-neutrale Felder
- `source_metadata`: namespaced, Source-spezifisch
- `raw_source_metadata`: optional, komprimiert, diagnostisch/rekonstruktiv
- `user_metadata`: Tags, Rating, Favoriten, lokale Notizen

## Cross-Source Dedup

Mehrere MediaReferences/Sources dürfen auf denselben MediaAsset/PhysicalBlob verweisen. Erkennung stufenweise über Source-IDs, cryptographic hash, perceptual image hash und später optional Video-Fingerprint. Niemals Source-Beziehungen verlieren, nur weil physisch dedupliziert wird.

## Local-first

Keine Pflicht-Cloud. SQLite enthält keine riesigen Medienblobs. Dateien bleiben im Dateisystem und werden über ArchiveFlow-IDs/Hashes referenziert. Dateipfade können sich ändern.

## UI-Regel

Gemeinsame UI kennt Sources über Capabilities und UI-Slots. Beispiel: Instagram darf Stories/Highlights-Slots anbieten; Reddit kann Communities/Comments ergänzen; YouTube Playlists/Livestreams. Gemeinsame Screens werden nicht geforkt.

## Contract Tests

Jeder Adapter muss dieselbe Test-Suite bestehen: IDs, Pagination, Zeitnormalisierung, Capability-Konsistenz, Candidate-Reihenfolge, Cancellation, Error Mapping, Retry-Sicherheit, keine Core-Leaks. Fixtures bleiben pro Source getrennt.

## Review-Frage

Bei jeder Architekturentscheidung explizit prüfen:

> Würde dieser Code unverändert funktionieren, wenn morgen ein zweiter Source-Adapter registriert wird?

Wenn nein, muss begründet werden, warum die Logik wirklich zum Core gehört und nicht in Adapter/Capability/UI-Slot verschoben werden sollte.
