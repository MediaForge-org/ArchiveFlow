use serde::Serialize;

use crate::error::AppError;

#[derive(Debug, Serialize)]
pub struct HealthStatus {
    pub status: &'static str,
    pub app_version: String,
    /// Sanity check that the source-neutral hashing crate is wired up and
    /// produces stable output — not a real health metric.
    pub build_fingerprint: String,
}

#[tauri::command]
pub fn health_check(app_version: String) -> Result<HealthStatus, AppError> {
    if app_version.trim().is_empty() {
        return Err(AppError::Internal(
            "app_version must not be empty".to_string(),
        ));
    }

    let build_fingerprint = af_hashing::hash_bytes(app_version.as_bytes()).to_string();

    Ok(HealthStatus {
        status: "ok",
        app_version,
        build_fingerprint,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn health_check_reports_ok_for_a_valid_version() {
        let status = health_check("0.1.0".to_string()).expect("valid version");
        assert_eq!(status.status, "ok");
        assert_eq!(status.app_version, "0.1.0");
        assert!(!status.build_fingerprint.is_empty());
    }

    #[test]
    fn health_check_rejects_empty_version_with_typed_error_not_a_panic() {
        let err = health_check("  ".to_string()).unwrap_err();
        assert!(matches!(err, AppError::Internal(_)));
    }
}
