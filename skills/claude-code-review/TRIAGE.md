# Decide whether a finding deserves a fix

A finding deserves a fix when the change introduces or worsens a concrete problem and correcting it is worth the added code and maintenance. Establish both the problem and its relevance to this change.

## Check the claim

Trace a claimed bug from a real input or reachable state to the failure. Check the actual callers, boundary validation, persisted data, framework guarantees, and recovery behavior that matter to that path.

Trust established internal contracts. An internal helper need not handle values its callers cannot supply. A type annotation or cast alone does not establish that an external response or stored record satisfies the contract. Cite the guard or invariant before declaring a state unreachable.

Distinguish intended behavior from collateral damage. An intentional API removal does not need a compatibility shim. A supported caller that the change was meant to migrate may still need a fix. Use the user's requirements and the change's context to establish intent, rather than infer it from the disputed code alone.

## Weigh the cost

Consider the likelihood and consequence of the failure, then the complexity of the correction. A theoretical chain of unsupported assumptions does not justify defensive code. A rare but reachable loss of data, authorization failure, or unrecoverable operation can justify a fix without evidence that it has happened in production.

For cleanup findings, name the present maintenance cost and explain how the correction reduces it. Reusing an existing helper can qualify when both callers share the same rule. Similar-looking code alone does not justify an abstraction. Apply repository conventions that govern the changed code, and distinguish them from the reviewer's preferences.

## Assign a disposition

Use one disposition for each finding:

- `fix`: Evidence establishes a problem introduced or worsened by this change, and a proportionate correction preserves the intended behavior.
- `leave`: The finding is wrong, describes intended behavior, requires an unreachable state, or offers too little benefit for the change it needs. State which reason applies and cite the evidence.
- `separate`: The problem exists independently of this change, which does not worsen it. Report consequential problems without expanding the fix assignment.
- `unresolved`: Missing evidence or an unsettled requirement prevents a decision. State what would settle it. Ask the user only when the answer requires their knowledge or judgment.

Uncertainty is neither proof of a bug nor proof that a path is unreachable. Investigate what the repository can answer, and retain any remaining uncertainty in the report.
