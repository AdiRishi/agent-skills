# Sequence work into verifiable units

Break multi-step work into units that each end in a state you can check. Verify the current unit before building the next one on top of it.

A failure found beside the change that caused it is cheap to locate. A failure found after a large batch forces the reader to search the whole batch.

## Execute in checked units

- Choose the smallest useful unit that ends in a meaningful check.
- Start from a known baseline.
- Make one coherent change.
- Run the check that proves that unit.
- Continue only after the result is understood.

## Order the delivery

Arrange commits or pull requests so each one stands on its own and the sequence explains the work. Useful orders include a failing test before its fix, subtraction before a reshape, a measured baseline before an improvement, and shared setup before the behavior that uses it.

Do not split work into tiny commits that have no independent meaning. The unit is defined by a useful verification boundary, not by line count.

[Prove the behavior directly](prove-it-works.md) at each boundary.
