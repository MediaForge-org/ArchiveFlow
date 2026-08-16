//! Stable, serializable error DTO for Tauri commands.
//!
//! Rule (P001 architecture requirements): Rust errors must never cross the
//! IPC boundary as raw strings. Every command returns `Result<T, AppError>`
//! so the frontend can branch on a stable `code`, not on message text.

use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "code", content = "message", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AppError {
    #[error("internal error: {0}")]
    Internal(String),
}
