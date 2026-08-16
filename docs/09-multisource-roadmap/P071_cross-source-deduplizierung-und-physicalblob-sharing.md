# Prompt P071 — Cross-Source Deduplizierung und PhysicalBlob Sharing

> **Diesen Prompt einzeln an Claude/Codex geben.** Er ist ein eigenständiges Scrum-Arbeitspaket. Lies zusätzlich `ARCHITECTURE_GUARDRAILS.md`; diese Regeln sind verbindlich.

**Phase:** `09-multisource-roadmap`  
**Abhängigkeiten:** P024, P048, P060  
**UI-Referenzen:** UI-105, UI-106  
**Empfohlener Branch:** `pkg/P071-cross-source-deduplizierung-und-physicalblob-sha`

## Auftrag

Cross-Source Deduplizierung und PhysicalBlob Sharing als klar begrenztes ArchiveFlow-Arbeitspaket umsetzen.

## Verbindlicher Produktkontext

Du arbeitest an **ArchiveFlow — Social Media Archive Manager**, einer local-first Desktop-Anwendung für langfristige Social-Media-Archive mit optionalen Browser-Companions. **Instagram ist Source #1 und die erste vollständig implementierte Plattform, aber nicht die Architektur des Produkts.** Weitere Sources wie TikTok, X, Reddit, YouTube und Threads müssen später über versionierte Source-Adapter ergänzt werden können, ohne Task Engine, Explorer/Library, Storage, Suche, Datenbank, Verifikation, Backup oder gemeinsame UI-Grundlagen grundsätzlich umzuschreiben. Die Desktop-App ist das Hauptprodukt; Browser-Extensions sind Source-spezifische Companions.

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

- Deduplizierung source-übergreifend auf `MediaAsset`/`PhysicalBlob` erweitern.
- Stufen: externe IDs nur innerhalb einer Source, SHA-256 global, perceptual image hash; Video-Fingerprint als erweiterbarer Hook.
- Mehrere MediaReferences/Provenance-Einträge behalten, obwohl physisch nur ein Blob gespeichert wird.
- Sichere Merge-/Unmerge-Operationen und Side-by-Side-Prüfung für unsichere Treffer.
- Speicherersparnis berechnen und im UI anzeigen.

## Explizit nicht Teil dieses Pakets

Kein automatisches Löschen bei unsicherer Ähnlichkeit; kein Cloud-Fingerprinting.

## UI-/UX-Anforderungen

- Verwende die referenzierten Mockups als visuelle Zielrichtung. Spezifikation hat bei Widerspruch Vorrang.
- Keine statischen Fake-Werte in produktiver UI; Daten über typed State/Repositories.
- Loading, Error, Empty, Keyboard/Fokus und große Datenmengen berücksichtigen.
- Source-spezifische UI nur über Capabilities/Slots einblenden.

## Architektur- und Implementierungsanforderungen

- Keine Source-Hardcodes im Core.
- Öffentliche Interfaces typisiert, dokumentiert und getestet.
- Keine blockierenden File/Network-Operationen im React-Thread.
- DB-Änderungen nur über Migrationen.
- Auditierbare Zustandsänderungen und stabile Fehlercodes.

## Tests

- Unit-Tests der neuen reinen Logik.
- Integrationtests für DB/Filesystem/Task Engine/Source Registry, soweit berührt.
- Mindestens ein realistischer Negativtest.
- Contract-/Dummy-Source-Test, wenn Source-Verhalten berührt wird.
- UI-Component/E2E-Test für kritische Interaktion.

## Definition of Done / Akzeptanzkriterien

- [ ] Identische Datei aus zwei Sources belegt optional nur einen PhysicalBlob.
- [ ] Beide Source-Provenances bleiben vollständig erhalten.
- [ ] Hash-Kollision/unsicherer perceptual match wird nicht automatisch zusammengeführt.
- [ ] Unmerge stellt logische Beziehungen ohne Datenverlust wieder her.

Zusätzlich immer:
- [ ] Formatter/Linter/Typecheck grün.
- [ ] Relevante Tests und Build grün.
- [ ] Keine Secrets/Cookies/Passwörter in Logs, Fixtures oder Snapshots.
- [ ] Architektur-/README-Doku aktualisiert.

## Abschlussbericht

Gib nur eine kompakte technische Übergabe aus: Branch, Dateien, implementierte Punkte, Tests, bekannte Grenzen und ob P072 sicher gestartet werden kann.
