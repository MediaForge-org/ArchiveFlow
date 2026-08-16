//! Source-neutral archive identity primitives.
//!
//! `ArchiveFlowId` is deliberately independent of any source id, username or
//! file path (Architecture Guardrail: "ArchiveFlow-IDs"). This crate must
//! never import or branch on a specific `Source`.

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Domain an `ArchiveFlowId` belongs to. New entity kinds are added here as
/// the domain model grows; this list is not source-specific.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityKind {
    SourceAccount,
    ArchiveIdentity,
    ContentItem,
    MediaReference,
    MediaAsset,
    PhysicalBlob,
    TaskJob,
}

impl EntityKind {
    fn prefix(self) -> &'static str {
        match self {
            EntityKind::SourceAccount => "sacc",
            EntityKind::ArchiveIdentity => "aid",
            EntityKind::ContentItem => "item",
            EntityKind::MediaReference => "mref",
            EntityKind::MediaAsset => "asset",
            EntityKind::PhysicalBlob => "blob",
            EntityKind::TaskJob => "task",
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ArchiveFlowIdError {
    #[error("archiveflow id must start with \"af_\", got: {0}")]
    MissingNamespace(String),
    #[error("archiveflow id has unknown entity prefix: {0}")]
    UnknownEntityPrefix(String),
    #[error("archiveflow id is missing an opaque suffix: {0}")]
    MissingSuffix(String),
}

/// A stable, source-independent identifier of the shape
/// `af_<entity>_<opaque>`, e.g. `af_item_9f2c...`.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ArchiveFlowId(String);

impl ArchiveFlowId {
    pub fn new(kind: EntityKind, opaque_suffix: &str) -> Self {
        Self(format!("af_{}_{opaque_suffix}", kind.prefix()))
    }

    pub fn parse(raw: &str) -> Result<Self, ArchiveFlowIdError> {
        let rest = raw
            .strip_prefix("af_")
            .ok_or_else(|| ArchiveFlowIdError::MissingNamespace(raw.to_string()))?;

        let (prefix, suffix) = rest
            .split_once('_')
            .ok_or_else(|| ArchiveFlowIdError::MissingSuffix(raw.to_string()))?;

        if suffix.is_empty() {
            return Err(ArchiveFlowIdError::MissingSuffix(raw.to_string()));
        }

        let known = [
            EntityKind::SourceAccount,
            EntityKind::ArchiveIdentity,
            EntityKind::ContentItem,
            EntityKind::MediaReference,
            EntityKind::MediaAsset,
            EntityKind::PhysicalBlob,
            EntityKind::TaskJob,
        ]
        .into_iter()
        .any(|kind| kind.prefix() == prefix);

        if !known {
            return Err(ArchiveFlowIdError::UnknownEntityPrefix(raw.to_string()));
        }

        Ok(Self(raw.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for ArchiveFlowId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_namespaced_id_per_entity_kind() {
        let id = ArchiveFlowId::new(EntityKind::ContentItem, "abc123");
        assert_eq!(id.as_str(), "af_item_abc123");
    }

    #[test]
    fn round_trips_through_parse() {
        let id = ArchiveFlowId::new(EntityKind::PhysicalBlob, "deadbeef");
        let parsed = ArchiveFlowId::parse(id.as_str()).expect("valid id");
        assert_eq!(id, parsed);
    }

    #[test]
    fn rejects_id_without_af_namespace() {
        let err = ArchiveFlowId::parse("item_abc123").unwrap_err();
        assert_eq!(
            err,
            ArchiveFlowIdError::MissingNamespace("item_abc123".to_string())
        );
    }

    #[test]
    fn rejects_unknown_entity_prefix() {
        // "ig_" would be an Instagram-flavoured prefix — must never be accepted,
        // ArchiveFlow ids are source-neutral by construction.
        let err = ArchiveFlowId::parse("af_ig_abc123").unwrap_err();
        assert_eq!(
            err,
            ArchiveFlowIdError::UnknownEntityPrefix("af_ig_abc123".to_string())
        );
    }
}
