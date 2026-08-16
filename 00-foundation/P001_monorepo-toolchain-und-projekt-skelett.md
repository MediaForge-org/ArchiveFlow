# Prompt P001 — Monorepo, Source-neutrale Toolchain und Projekt-Skelett

> **Diesen Prompt einzeln an Claude/Codex geben.** Er ist ein eigenständiges Scrum-Arbeitspaket und soll nicht mit späteren Paketen vorgezogen werden.

**Phase:** `00-foundation`  
**Abhängigkeiten:** keine  
**UI-Referenzen:** UI-093, UI-094
**Empfohlener Branch:** `pkg/P001-monorepo-toolchain-und-projekt-skelett`

## Auftrag

Lege das technische Fundament für Desktop-App, Browser-Extension, gemeinsame TypeScript-Pakete und Rust-Crates.

## Verbindlicher Produktkontext

Du arbeitest an **ArchiveFlow — Social Media Archive Manager**, einer local-first Desktop-Anwendung für langfristige Social-Media-Archive mit optionalen Browser-Companions. **Instagram ist Source #1 und die erste vollständig implementierte Plattform, aber nicht die Architektur des Produkts.** Weitere Sources wie TikTok, X, Reddit, YouTube und Threads müssen später über versionierte Source-Adapter ergänzt werden können, ohne Task Engine, Explorer/Library, Storage, Suche, Datenbank, Verifikation, Backup oder gemeinsame UI-Grundlagen grundsätzlich umzuschreiben. Die Desktop-App ist das Hauptprodukt; Browser-Extensions sind Source-spezifische Companions.

**Technischer Zielstack:**
- Desktop: Tauri 2, Rust-Backend, React + TypeScript Frontend.
- Browser-Companion: TypeScript, React wo UI nötig ist, Chromium Manifest V3.
- Verbindung Extension ↔ Desktop: Native Messaging oder eine gleichwertig sichere lokale IPC-Lösung; keine Cloud-Pflicht.
- Persistenz: SQLite mit versionierten Migrationen.
- Große Dateien/Downloads: Rust-Seite; UI bleibt responsiv und darf keine großen Binärdaten im Frontend halten.
- Tests: Rust Unit/Integration Tests, Vitest für TypeScript, Playwright für kritische UI-/Extension-Flows.
- CI: Build, Lint, Typecheck, Tests und Packaging-Checks über GitHub Actions.

**Produkt- und Architektur-Invarianten, die nicht verletzt werden dürfen:**
1. **Source-neutraler Core:** Kein `if source == "instagram"` oder vergleichbarer Plattform-Hardcode in Core, Task Engine, Archive, Explorer, Search, Storage, Backup oder gemeinsamen UI-Komponenten. Source-spezifische Logik gehört ausschließlich in Source-Adapter/Source-Companions.
2. **Source SDK + Capabilities:** Neue Sources implementieren versionierte Source-SDK-Verträge und deklarieren granular ihre Fähigkeiten (z. B. posts, short_video, stories, highlights, comments, saved, following, playlists). Die UI entscheidet capability-basiert, nicht anhand des Source-Namens.
3. **Source-neutrales Datenmodell:** Verwende generische Modelle wie `Source`, `SourceAccount`, `ArchiveIdentity`, `ContentItem`, `MediaReference`, `MediaAsset`, `PhysicalBlob`, `Relationship`, `TaskJob`. Begriffe wie Reel/Highlight dürfen als Source-Metadaten oder UI-Labels existieren, nicht als zentrale Core-Tabellen/Architektur.
4. **Logisch vs. physisch trennen:** Ein Content- oder Media-Eintrag ist nicht identisch mit einer Datei. Mehrere Source-Referenzen dürfen auf dasselbe `MediaAsset`/`PhysicalBlob` zeigen. Das ermöglicht Cross-Source-Deduplizierung ohne Informationsverlust.
5. **ArchiveFlow-IDs:** Interne IDs (`af_*`) sind unabhängig von Source-IDs, Usernames und Dateipfaden. Source-IDs werden separat gespeichert. Dateipfade sind Storage-Locations, niemals Identität.
6. **Provenance:** Für jedes archivierte Medium müssen Herkunft, Source, Source-Account-ID, Source-Content/Media-ID, Veröffentlichungszeit, Discovery-/Downloadzeit, Adapter-Version, verwendeter Media Candidate und Hash nachvollziehbar sein.
7. **Metadaten-Schichten:** `core_metadata`, namespaced `source_metadata`, optional komprimierte Raw-Source-Metadaten und `user_metadata` (Tags, Rating, Favorit) strikt trennen. Neue Plattformfelder dürfen keine Core-Schema-Umbauten erzwingen.
8. **Discovery ≠ Acquisition:** Finden/Indexieren von Accounts, Content und Media Candidates ist von tatsächlichem Download getrennt. Metadaten-only, Dry Run und späterer Download müssen möglich sein.
9. **Generische Task Engine:** Persistente Jobs sind nicht nur Downloads. Unterstütze generische Task-Typen und Abhängigkeiten/DAGs wie DISCOVER, RESOLVE_MEDIA, DOWNLOAD, VERIFY, HASH, THUMBNAIL, SYNC, BACKUP, REINDEX, MIGRATE. Fehler eines Downstream-Jobs dürfen keinen unnötigen Redownload erzwingen.
10. **Persistenz & Recovery:** Queue/Task-Status, Pause/Resume, Retry/Backoff, Crash-Recovery und `.part`-Dateien sind persistent. Keine kritischen Zustände nur im RAM.
11. **Source-spezifische Rate Policies:** Rate-Limit, Concurrency, Cooldown und adaptive Geschwindigkeit werden pro Source/Adapter geregelt; der Scheduler konsumiert eine generische Policy.
12. **Maximale legitime Qualität:** Standard ist die höchste von der jeweiligen Source für die aktuelle legitime Session bereitgestellte Qualität. Keine künstliche Hochskalierung als „Original“ ausgeben.
13. **Dateinamen/Ordner source-aware:** Standard enthält mindestens Accountname + ursprüngliches Veröffentlichungsdatum. Templates unterstützen zusätzlich `{source}`, IDs und Medientyp. Der Explorer darf nie vom Dateinamen abhängen.
14. **Multi-Asset-Content:** Galleries/Carousels/Slideshows sind Content mit 1..n MediaReferences; Komplettdownload und Einzelauswahl müssen möglich sein.
15. **Preflight vor Bulk:** Vor großen Downloads/Synchronisierungen: Medienanzahl pro Account/Source, Gesamtzahl, bereits archiviert, neu, geschätzte/ermittelte Größe, freier Speicher und erwarteter Restplatz anzeigen.
16. **Archivmodus:** Remote verschwundene Inhalte werden standardmäßig lokal behalten und nur als `MISSING_REMOTE`/entsprechender Status markiert.
17. **Account-Identität:** `SourceAccount` basiert auf stabiler Source-Account-ID; Username-Historie separat. Eine optionale `ArchiveIdentity` darf mehrere Accounts derselben Person/Entität plattformübergreifend manuell verknüpfen, aber nie automatisch behaupten, zwei Accounts gehörten derselben Person.
18. **Local-first:** Medien, Datenbank, Suche und Archive funktionieren lokal ohne ArchiveFlow-Cloud-Zwang. SQLite speichert Metadaten/Relationen/Status, nicht große Media-Blobs.
19. **Gemeinsame Core-Services:** Thumbnailing, Media Probe, Hashing, Search Index, Collections, Storage, Backup, Audit Log und Viewer sind source-neutral.
20. **Versionierung & Tests:** Adapter-Verträge sind versioniert (`adapterApiVersion`). Jeder Adapter muss eine gemeinsame Contract-Test-Suite und Source-Fixtures bestehen. Ein neuer Dummy-/Reference-Adapter muss ohne Änderungen an Core/Library/Task Engine registrierbar sein.
21. **Isolation vorbereiten:** Source-Adapter sollen später in separaten Source-Workern/Prozessen isolierbar sein; keine Annahme, dass Source-Code dauerhaft im UI-Prozess läuft.
22. **Feature Flags & UI Slots:** Experimentelle Features über Feature Flags; source-spezifische UI-Erweiterungen über definierte Slots/Capabilities statt Forks gemeinsamer Screens.
23. **Import/Export offen halten:** Importer sind modular (z. B. Data Export ZIP, bestehende Ordner, andere Archive). Export unterstützt portable, dokumentierte ArchiveFlow-Pakete sowie JSON/CSV/Manifest; kein Lock-in.
24. **Keine Credential-Umgehung:** Keine Passwörter in der Desktop-App speichern, wenn die Source über bestehende Browser-Session angebunden ist. Keine Umgehung von Zugriffskontrollen, Captchas, privaten Inhalten oder Rate-Limits.
25. **Kleine Pakete:** Änderungen bleiben paketweise testbar, rückbaubar und auf den beschriebenen Scope begrenzt.

## Scope dieses Pakets

- pnpm-Workspace/Rust-Workspace anlegen mit klarer Trennung von Apps, Core und Sources.
- Zielstruktur mindestens vorbereiten:
  - `apps/desktop`
  - `apps/extension-instagram`
  - `packages/core`
  - `packages/source-sdk`
  - `packages/media-model`
  - `packages/protocol`
  - `packages/search`
  - `packages/ui`
  - `sources/instagram`
  - Rust-Crates für `task-engine`, `archive`, `storage`, `media-probe`, `thumbnail`, `hashing`.
- `source-sdk` darf keine Instagram-Abhängigkeit besitzen.
- Source Registry/Manifest-Schnittstelle als leeres, aber kompiliertes Fundament vorbereiten.
- Tauri-2-App initialisieren; React/TypeScript Frontend und Rust Backend sauber trennen.
- Instagram-Browser-Companion als erste Extension-App initialisieren, aber kein gemeinsames Package `instagram-core` o. Ä. anlegen.
- Einheitliche tsconfig/eslint/prettier/Rust fmt/clippy Konfiguration und Root-Skripte definieren.
- `ARCHITECTURE_GUARDRAILS.md` im Repo verlinken und als Review-Kriterium dokumentieren.
- README mit Source-neutraler Verzeichnisstruktur, lokalen Startbefehlen und klarer Aussage „Instagram = Source #1, nicht Core“ erstellen.

## Explizit nicht Teil dieses Pakets

- Kein Instagram-Zugriff.
- Keine Datenbanktabellen.

## UI-/UX-Anforderungen

- Verwende die referenzierten Mockups (keine direkte Mockup-Abhängigkeit) als visuelle Zielrichtung, sofern vorhanden.
- Keine statischen Fake-Werte in produktiver UI. Lade Werte über typed State/Repositories.
- Lade-/Fehler-/Empty-Zustände müssen mitimplementiert werden, nicht nur der Happy Path.
- Alle neuen Controls müssen per Tastatur erreichbar sein; Fokuszustand sichtbar.
- Lange Listen/Tables müssen für große Datenmengen vorbereitet sein (Pagination/Virtualisierung, wo relevant).

## Architektur- und Implementierungsanforderungen

- Halte Instagram-spezifische Logik aus generischen Download-, Storage- und Library-Komponenten heraus.
- Neue öffentliche Interfaces müssen typisiert, dokumentiert und getestet sein.
- Keine blockierenden Datei-/Netzwerkoperationen im React-Thread.
- Rust-Fehler nicht als rohe Strings durchreichen; mappe sie in stabile Fehlercodes/DTOs.
- Datenbankänderungen ausschließlich über Migrationen.
- Bestehende Daten müssen bei Migrationen erhalten bleiben.
- Wo Wiederaufnahme relevant ist: Fortschritt und Resume-Metadaten persistent speichern, nicht nur im RAM.

## Tests, die du in diesem Paket anlegen/erweitern musst

- Unit-Tests für neue reine Logik.
- Integrationtests für DB/Filesystem/IPC, falls das Paket diese Schichten berührt.
- Mindestens ein negativer Test für einen realistischen Fehlerfall.
- Bestehende Regression-Fixtures erweitern, wenn Instagram-Parsing betroffen ist.
- UI-Smoke-Test oder Component-Test für kritische Interaktion, falls UI betroffen ist.

## Definition of Done / Akzeptanzkriterien

- [ ] Desktop- und Instagram-Extension-Shell lassen sich separat bauen/starten.
- [ ] `source-sdk` und `core` kompilieren ohne Import aus `sources/instagram`.
- [ ] Ein leerer Dummy-Source-Manifest kann registriert werden, ohne Core-Code zu ändern.
- [ ] Root-Befehl führt Typecheck/Lint/Tests aus.
- [ ] Keine Businesslogik oder Instagram-Parser in diesem Paket.

Zusätzlich immer:
- [ ] Formatter/Linter/Typecheck sind grün.
- [ ] Betroffene Unit- und Integrationtests sind grün.
- [ ] Betroffener Build läuft erfolgreich.
- [ ] Keine Secrets, Cookies oder Passwörter in Logs, Fixtures, DB-Migrationen oder Test-Snapshots.
- [ ] README/Architekturdoku wurde aktualisiert, wenn sich öffentliche Interfaces oder Nutzerverhalten ändern.

## Abschlussbericht, den du nach der Implementierung ausgeben sollst

Gib am Ende **nur eine kompakte technische Übergabe** mit:
1. Branchname.
2. Geänderten/neu angelegten Dateien.
3. Implementierten Punkten.
4. Ausgeführten Tests + Ergebnis.
5. Offenen bekannten Grenzen.
6. Ob P002 bzw. das nächste abhängige Paket sicher gestartet werden kann.

## Arbeitsweise für dieses Paket

1. Lies zuerst vorhandenen Code, Tests, Architektur-Dokumente und relevante Interfaces. Erfinde keine zweite Parallelarchitektur, wenn bereits passende Abstraktionen vorhanden sind.
2. Arbeite auf einem **eigenen Feature-Branch** für genau dieses Paket. `main` bleibt grün und unverändert, bis die Arbeit vollständig getestet ist.
3. Implementiere nur den beschriebenen Scope. Notwendige kleine Vorarbeiten sind erlaubt, müssen aber dokumentiert werden.
4. Ergänze/aktualisiere Tests zusammen mit der Implementierung.
5. Führe am Ende mindestens Formatter, Linter, Typecheck, relevante Unit-/Integrationtests und den Build des betroffenen Teilprojekts aus.
6. Liefere zum Abschluss eine kurze technische Zusammenfassung: geänderte Dateien, Architekturentscheidungen, Tests, bekannte Grenzen, nächster sinnvoller Paketanschluss.
7. Falls ein UI-Mockup referenziert ist: nutze es als visuelle Zielvorgabe. Wenn Mockup und diese Spezifikation widersprechen, hat die Spezifikation Vorrang.

## Zusätzliche Hinweise

- Keine zusätzlichen Hinweise.
