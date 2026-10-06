---
name: commbank-archive
description: Extract and maintain Adi's numbered Commbank Data archive with verified transaction exports and statements.
disable-model-invocation: true
---

# Maintain the Commbank archive

Maintain the bank's original CSV, OFX, and PDF files in `~/Desktop/Commbank Data`. Use the archive's current README and audit records to establish coverage. Keep raw downloads unchanged.

## Establish scope and cutoff

Track the accounts already represented in the archive. The established scope is Spending Offset, Savings Offset, Mastercard Ultimate, and Home Loan. Identify them by nickname and account suffix from the README and OFX contents. CDIA, Saver, Super, and CommSec are outside this scope unless the user changes it explicitly.

Use the requested inclusive cutoff, not today's date. For "end of last month," calculate the previous calendar month's last day in the user's timezone. Ask only when the requested date is genuinely ambiguous.

Run the local audit helper before collecting files. Resolve the script path relative to this skill directory. Save its output outside the archive as the baseline:

```bash
python3 scripts/audit_archive.py "$HOME/Desktop/Commbank Data" --cutoff YYYY-MM-DD --report /absolute/work/before.json
```

Inspect actual transaction dates and counts. A broad filename does not prove broad coverage. Read [NetBank collection notes](references/netbank.md) before browser collection for export mechanics and known failures.

## Collect in a separate folder

Create a sibling staging folder for the requested cutoff. Keep new downloads there until checked. Prefer the user's chosen browser and authenticated session. Use available browser UI tools for NetBank navigation and downloads.

For each tracked account:

1. Extend the structured history through the cutoff with both CSV and OFX from the same account and requested dates. Use a modest overlap with the existing exports to verify continuity.
2. If earlier structured history is absent or incomplete, request the earliest accepted date. Split a large date window when the UI limits results or truncates the export.
3. Inspect every relevant statement financial year. Collect missing PDFs, including older periods beyond export availability. Retain older saved files even when NetBank no longer offers them.
4. Record the requested window, actual first and last transaction dates, account identity, row count, and available statement periods. An accepted search date does not establish account activity that far back.

Bind each export to its download event or link and inspect the resulting file. Never choose a file solely because it is the newest download with that extension. That can select a stale file from another account.

## Keep the human numbering

Keep banking files flat in the final archive. Put coverage and verification records in `audit/`.

```text
074a_cba_spending-offset_2026-08-01_2026-09-30.csv
074b_cba_spending-offset_2026-08-01_2026-09-30.ofx
079_cba_spending-offset_statement_2026-06-25_2026-09-24_issued-2026-09-24.pdf
```

Preserve existing names and numbers. Use the next unused numeric prefix for each new export pair or statement, with at least three digits. Use `a` for CSV and `b` for OFX. Use the actual statement period and issue date for PDF names. Export names describe requested dates; record actual contents separately.

Numbers are stable collection identifiers that help people upload in batches. They are not chronological transaction identifiers. Keep existing overlaps rather than deleting source files to make the archive appear simpler.

## Verify the combined candidate

Build a self-contained candidate from unchanged existing banking files plus the new downloads. Update its README for the actual cutoff and account coverage. Run:

```bash
python3 scripts/audit_archive.py /absolute/staging/merge-preview --cutoff YYYY-MM-DD --baseline /absolute/work/before.json --report /absolute/work/candidate.json
```

The helper checks original banking-file hashes, file pairs, signed amounts and dates, known account suffixes, filename windows, cutoff dates, and PDF signatures. It reports unique structured row counts while preserving identical-row multiplicity. It does not establish PDF account identity, complete bank availability, or full statement reconciliation. Inspect those from NetBank and the PDF contents.

Confirm balance continuity for balance-bearing exports. Compare statement periods and opening and closing balances. For cards, account for transaction dates preceding statement posting dates. Confirm boundary allocations from the following statement when available; label remaining allocations as inferred. Monetary exports can omit zero-dollar fee-saving entries and nonmonetary loan notices.

Compare overlapping exports using complete CSV rows and preserve each row's maximum multiplicity across files. Use this as a coverage diagnostic, not a universal importer identity rule. Review differences in descriptions or dates. CSV and OFX pairs and overlapping PDFs describe the same underlying transactions. Avoid counting them twice. OFX FITID fields can be blank.

State the accounts, inclusive cutoff, naming convention, actual structured dates, PDF coverage, count definitions, overlaps, known gaps, and verification limits in the README. Separate PDF-only history from structured transaction counts. Use final archive paths in its README and manifests.

## Finalize within the user's authorization

When the user requested a preview, finish with the checked candidate and coverage report. When the user requested the final archive, merge verified additions without another permission question. Replace the README and preserve the former README in `audit/`. Verify final hashes and counts before removing temporary folders the user authorized you to remove.

Keep dated run reports in `audit/` so future updates retain previous cutoff and collection evidence. Refresh the current file inventory and coverage report. Exclude README and audit files from the banking upload set.

Complete the task only when every scoped account has an export through the cutoff or a documented bank limitation. Account for all available relevant statements and verify the final or staged archive. Report the destination, cutoff, additions, and any unresolved coverage gap.
