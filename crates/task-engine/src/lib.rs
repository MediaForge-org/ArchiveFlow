//! Source-neutral persistent task engine primitives.
//!
//! Download is just one `TaskKind`. Nothing in this crate may branch on a
//! specific `Source` (Architecture Guardrail: "Generische Task Engine").
//! Persistence (SQLite-backed queue, crash recovery) lands in a later
//! package; this crate fixes the task/status/dependency shape so it can be
//! depended on now without a rewrite later.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskKind {
    DiscoverAccount,
    DiscoverContent,
    ResolveMedia,
    DownloadMedia,
    VerifyMedia,
    HashMedia,
    GenerateThumbnail,
    Sync,
    Backup,
    Restore,
    Reindex,
    Migrate,
    Import,
    Export,
    HealthCheck,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Pending,
    Blocked,
    Running,
    Paused,
    Failed,
    Completed,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TaskId(pub String);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskJob {
    pub id: TaskId,
    pub kind: TaskKind,
    pub status: TaskStatus,
    /// Tasks that must reach `Completed` before this one may run.
    pub depends_on: Vec<TaskId>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum TaskGraphError {
    #[error("task {0:?} depends on unknown task {1:?}")]
    UnknownDependency(TaskId, TaskId),
    #[error("task dependency graph contains a cycle involving {0:?}")]
    CyclicDependency(TaskId),
}

/// Returns the ids of tasks that are ready to run: not yet completed, and
/// every dependency already `Completed`. A downstream job's failure never
/// forces its already-completed upstream dependencies to redo work — this
/// function only ever looks forward.
pub fn ready_tasks(jobs: &[TaskJob]) -> Result<Vec<TaskId>, TaskGraphError> {
    let by_id: HashMap<&TaskId, &TaskJob> = jobs.iter().map(|j| (&j.id, j)).collect();

    for job in jobs {
        for dep in &job.depends_on {
            if !by_id.contains_key(dep) {
                return Err(TaskGraphError::UnknownDependency(
                    job.id.clone(),
                    dep.clone(),
                ));
            }
        }
    }

    assert_acyclic(jobs, &by_id)?;

    Ok(jobs
        .iter()
        .filter(|job| {
            job.status == TaskStatus::Pending
                && job.depends_on.iter().all(|dep| {
                    by_id
                        .get(dep)
                        .is_some_and(|d| d.status == TaskStatus::Completed)
                })
        })
        .map(|job| job.id.clone())
        .collect())
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum VisitState {
    InProgress,
    Done,
}

fn assert_acyclic(
    jobs: &[TaskJob],
    by_id: &HashMap<&TaskId, &TaskJob>,
) -> Result<(), TaskGraphError> {
    let mut state: HashMap<&TaskId, VisitState> = HashMap::new();
    for job in jobs {
        visit(&job.id, by_id, &mut state)?;
    }
    Ok(())
}

fn visit<'a>(
    id: &'a TaskId,
    by_id: &HashMap<&'a TaskId, &'a TaskJob>,
    state: &mut HashMap<&'a TaskId, VisitState>,
) -> Result<(), TaskGraphError> {
    match state.get(id) {
        Some(VisitState::Done) => return Ok(()),
        Some(VisitState::InProgress) => return Err(TaskGraphError::CyclicDependency(id.clone())),
        None => {}
    }

    state.insert(id, VisitState::InProgress);
    if let Some(current_job) = by_id.get(id) {
        for dep in &current_job.depends_on {
            visit(dep, by_id, state)?;
        }
    }
    state.insert(id, VisitState::Done);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn job(id: &str, kind: TaskKind, status: TaskStatus, depends_on: &[&str]) -> TaskJob {
        TaskJob {
            id: TaskId(id.to_string()),
            kind,
            status,
            depends_on: depends_on.iter().map(|d| TaskId(d.to_string())).collect(),
        }
    }

    #[test]
    fn a_task_becomes_ready_once_its_dependency_completes() {
        let jobs = vec![
            job(
                "discover",
                TaskKind::DiscoverContent,
                TaskStatus::Completed,
                &[],
            ),
            job(
                "resolve",
                TaskKind::ResolveMedia,
                TaskStatus::Pending,
                &["discover"],
            ),
        ];

        let ready = ready_tasks(&jobs).unwrap();
        assert_eq!(ready, vec![TaskId("resolve".to_string())]);
    }

    #[test]
    fn a_task_is_not_ready_while_its_dependency_is_still_pending() {
        let jobs = vec![
            job(
                "discover",
                TaskKind::DiscoverContent,
                TaskStatus::Pending,
                &[],
            ),
            job(
                "resolve",
                TaskKind::ResolveMedia,
                TaskStatus::Pending,
                &["discover"],
            ),
        ];

        let ready = ready_tasks(&jobs).unwrap();
        assert_eq!(ready, vec![TaskId("discover".to_string())]);
    }

    #[test]
    fn downstream_failure_does_not_reset_completed_upstream_dependency() {
        // VERIFY_MEDIA failing must never force DOWNLOAD_MEDIA to be redone.
        let jobs = vec![
            job(
                "download",
                TaskKind::DownloadMedia,
                TaskStatus::Completed,
                &[],
            ),
            job(
                "verify",
                TaskKind::VerifyMedia,
                TaskStatus::Failed,
                &["download"],
            ),
        ];

        let ready = ready_tasks(&jobs).unwrap();
        assert!(
            ready.is_empty(),
            "failed task must not be re-surfaced as ready by this function"
        );
    }

    #[test]
    fn rejects_dependency_on_unknown_task() {
        let jobs = vec![job(
            "resolve",
            TaskKind::ResolveMedia,
            TaskStatus::Pending,
            &["ghost"],
        )];
        let err = ready_tasks(&jobs).unwrap_err();
        assert_eq!(
            err,
            TaskGraphError::UnknownDependency(
                TaskId("resolve".to_string()),
                TaskId("ghost".to_string())
            )
        );
    }

    #[test]
    fn diamond_shaped_dependencies_are_not_mistaken_for_a_cycle() {
        // a depends on b and c; b and c both depend on d. Reconverging paths
        // like this are valid DAGs, not cycles.
        let jobs = vec![
            job(
                "a",
                TaskKind::ResolveMedia,
                TaskStatus::Pending,
                &["b", "c"],
            ),
            job(
                "b",
                TaskKind::DiscoverContent,
                TaskStatus::Completed,
                &["d"],
            ),
            job(
                "c",
                TaskKind::DiscoverContent,
                TaskStatus::Completed,
                &["d"],
            ),
            job("d", TaskKind::DiscoverAccount, TaskStatus::Completed, &[]),
        ];

        let ready = ready_tasks(&jobs).unwrap();
        assert_eq!(ready, vec![TaskId("a".to_string())]);
    }

    #[test]
    fn rejects_cyclic_dependency_graph() {
        let jobs = vec![
            job("a", TaskKind::DiscoverContent, TaskStatus::Pending, &["b"]),
            job("b", TaskKind::ResolveMedia, TaskStatus::Pending, &["a"]),
        ];
        let err = ready_tasks(&jobs).unwrap_err();
        assert!(matches!(err, TaskGraphError::CyclicDependency(_)));
    }
}
