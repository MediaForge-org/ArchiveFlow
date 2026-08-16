//! Source-neutral physical storage location resolution.
//!
//! `PhysicalBlob`s are addressed by content hash, not by source, account or
//! filename (Architecture Guardrail: "Local-first" / "Dateipfade sind
//! Storage-Locations, niemals Identität"). This crate only computes where a
//! blob *would* live under a storage root; actual filesystem I/O belongs to
//! a later package (storage/migration/backup).

use std::path::{Path, PathBuf};

use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum StorageError {
    #[error("content hash must be non-empty hex")]
    EmptyHash,
    #[error("content hash must be at least 4 hex characters to shard, got: {0}")]
    HashTooShort(String),
}

/// Computes a sharded, content-addressed relative path for a blob, e.g.
/// hash `ab12cd...` under root `blobs/` becomes `blobs/ab/12/ab12cd...`.
///
/// Sharding by hash prefix keeps any single directory from accumulating
/// millions of entries regardless of which source produced the file.
pub fn blob_relative_path(content_hash: &str) -> Result<PathBuf, StorageError> {
    if content_hash.is_empty() {
        return Err(StorageError::EmptyHash);
    }
    if content_hash.len() < 4 {
        return Err(StorageError::HashTooShort(content_hash.to_string()));
    }

    let (shard_a, rest) = content_hash.split_at(2);
    let (shard_b, _) = rest.split_at(2);

    Ok(PathBuf::from(shard_a).join(shard_b).join(content_hash))
}

/// Resolves the absolute path of a blob under a given storage root.
pub fn blob_absolute_path(
    storage_root: &Path,
    content_hash: &str,
) -> Result<PathBuf, StorageError> {
    Ok(storage_root.join(blob_relative_path(content_hash)?))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shards_by_hash_prefix() {
        let path = blob_relative_path("ab12cd34ef").unwrap();
        assert_eq!(path, PathBuf::from("ab").join("12").join("ab12cd34ef"));
    }

    #[test]
    fn resolves_under_storage_root() {
        let root = Path::new("/archive/blobs");
        let path = blob_absolute_path(root, "deadbeef1234").unwrap();
        assert_eq!(path, PathBuf::from("/archive/blobs/de/ad/deadbeef1234"));
    }

    #[test]
    fn rejects_hash_too_short_to_shard() {
        let err = blob_relative_path("ab").unwrap_err();
        assert_eq!(err, StorageError::HashTooShort("ab".to_string()));
    }

    #[test]
    fn rejects_empty_hash() {
        let err = blob_relative_path("").unwrap_err();
        assert_eq!(err, StorageError::EmptyHash);
    }
}
