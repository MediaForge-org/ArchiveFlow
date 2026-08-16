//! Source-neutral cryptographic hashing for `PhysicalBlob` identity and dedup.
//!
//! Every archived file is identified by content hash, independent of which
//! `Source` it was discovered through. This crate has no knowledge of any
//! specific source and must stay that way.

use sha2::{Digest, Sha256};

/// A lowercase-hex SHA-256 digest, used as the stable content identity of a
/// `PhysicalBlob`.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Sha256Hex(String);

impl Sha256Hex {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for Sha256Hex {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

/// Hash a single in-memory byte buffer.
pub fn hash_bytes(bytes: &[u8]) -> Sha256Hex {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    Sha256Hex(hex::encode(hasher.finalize()))
}

/// Hash a stream of chunks without requiring the whole payload in memory at
/// once. Downloads are chunked, so this is the shape hashing will actually
/// be used in once storage/verification lands.
pub fn hash_chunks<'a, I: IntoIterator<Item = &'a [u8]>>(chunks: I) -> Sha256Hex {
    let mut hasher = Sha256::new();
    for chunk in chunks {
        hasher.update(chunk);
    }
    Sha256Hex(hex::encode(hasher.finalize()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hashes_known_vector() {
        // sha256("") — well-known empty-input vector.
        let got = hash_bytes(b"");
        assert_eq!(
            got.as_str(),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        assert_eq!(got.as_str().len(), 64);
    }

    #[test]
    fn chunked_hash_matches_whole_buffer_hash() {
        let whole = hash_bytes(b"hello world");
        let chunked = hash_chunks([b"hello ".as_slice(), b"world".as_slice()]);
        assert_eq!(whole, chunked);
    }

    #[test]
    fn different_content_yields_different_hash() {
        let a = hash_bytes(b"content-a");
        let b = hash_bytes(b"content-b");
        assert_ne!(a, b);
    }
}
