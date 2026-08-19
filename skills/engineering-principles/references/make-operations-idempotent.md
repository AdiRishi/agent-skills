# Make operations idempotent

Design a state-changing operation so repeated and partially completed runs converge on the same correct state.

Commands, lifecycle operations, and processing loops run amid retries, crashes, and restarts. A partial run must not leave state that changes the meaning of the next run.

## Design for convergence

- Discover existing state before creating more of it.
- Adopt valid live state and clean stale artifacts.
- Compare artifacts by identity or content, not creation order.
- Detect stale ownership before honoring a lock.
- Regenerate transient input after a failed cycle.
- Add reconciliation where a multi-step update can stop halfway.

Test the operation against these questions:

1. What happens if it runs twice in a row?
2. What happens if the previous run stops after each state change?
3. Can the next run determine the intended end state from durable facts?

If the answer depends on unexplained leftover state, add reconciliation or change the state model.
