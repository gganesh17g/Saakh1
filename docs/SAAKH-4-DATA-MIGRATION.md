# Saakh 4.0 data migration and restoration

The original business schema remains version 2 with operationsRevision 2. Existing v1/early-v2 migrations are retained, including source-preserving credit metadata normalization. No reset, reseed or destructive migration is performed on an existing valid ledger.

An optional `workspaceRestores4` object is additive metadata. Existing business arrays, stable IDs and accounting amounts are preserved during ordinary upgrade. A new independent workspace key has format version 1. Invalid workspace/ledger records produce a visible recovery error and cannot be silently overwritten by default values.

## Portable backup v1

`format: saakh-business-backup`, `version: 1`, timestamp, business identity/name, `collection-counts-v1` integrity metadata, selected-business ledger and selected-business tasks/scenarios/drafts and business-scoped layout/view preferences. Personal appearance/quality preferences are separate and not included. Downloaded JSON is unencrypted.

Restore validates before showing a record-count preview. Explicit confirmation creates a separate business, remaps record and source IDs, copies its opening statement balance and retains workspace snapshots in the committed ledger archive. Original businesses are not merged or replaced. Historical scenario snapshots remain historical; remapped source fingerprints may correctly be marked outdated and must be recalculated explicitly.

Unknown versions, missing required collections, cross-business relationships, corrupt arithmetic, unsafe object keys, duplicate IDs, invalid workspace snapshots and files over 20 MB are rejected. Imported content is data only; nothing is executed.

Export before rolling source versions back. Earlier versions cannot be expected to expose new workspace features. Backup restore is a local demo portability feature, not encrypted cloud backup or production disaster recovery.
