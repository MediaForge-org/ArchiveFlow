//! Source-neutral media technical-property probing contract.
//!
//! A `MediaProbe` inspects a downloaded file (dimensions, duration, codec,
//! container...) independent of which `Source` produced it. Concrete
//! implementations (ffprobe-backed, image-header-backed, ...) land in a
//! later package; this crate only fixes the shared contract and result
//! shape so Task Engine / Archive can depend on it now.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaKind {
    Image,
    Video,
    Audio,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MediaProbeResult {
    pub kind: MediaKind,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub duration_ms: Option<u64>,
    pub container: Option<String>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MediaProbeError {
    #[error("unreadable or corrupt media file: {0}")]
    Unreadable(String),
    #[error("probe backend does not support this media kind yet")]
    Unsupported,
}

/// Implemented by concrete probing backends. Kept generic over the byte
/// source so callers can probe from disk, memory, or a stream without this
/// crate knowing about any of it.
pub trait MediaProbe {
    fn probe(&self, bytes: &[u8]) -> Result<MediaProbeResult, MediaProbeError>;
}

#[cfg(test)]
mod tests {
    use super::*;

    struct AlwaysUnsupportedProbe;

    impl MediaProbe for AlwaysUnsupportedProbe {
        fn probe(&self, _bytes: &[u8]) -> Result<MediaProbeResult, MediaProbeError> {
            Err(MediaProbeError::Unsupported)
        }
    }

    struct FixedResultProbe(MediaProbeResult);

    impl MediaProbe for FixedResultProbe {
        fn probe(&self, _bytes: &[u8]) -> Result<MediaProbeResult, MediaProbeError> {
            Ok(self.0.clone())
        }
    }

    #[test]
    fn probe_trait_is_object_safe_and_returns_result() {
        let probe = FixedResultProbe(MediaProbeResult {
            kind: MediaKind::Image,
            width: Some(1920),
            height: Some(1080),
            duration_ms: None,
            container: Some("jpeg".to_string()),
        });

        let result = probe.probe(&[]).expect("fixed probe always succeeds");
        assert_eq!(result.kind, MediaKind::Image);
        assert_eq!(result.width, Some(1920));
    }

    #[test]
    fn unsupported_backend_reports_typed_error_not_a_raw_string() {
        let probe = AlwaysUnsupportedProbe;
        let err = probe.probe(&[1, 2, 3]).unwrap_err();
        assert_eq!(err, MediaProbeError::Unsupported);
    }
}
