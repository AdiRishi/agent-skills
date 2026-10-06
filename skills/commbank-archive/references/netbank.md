# NetBank collection notes

These observations come from the 6 October 2026 collection. Inspect the current UI rather than treating selectors or export limits as permanent contracts.

## Modern Spending and Savings pages

The account's **Timeframe** filter exposes custom From and To fields with `dd/mm/yyyy` placeholders. Apply the requested range, wait for the results, and use **Export**. Select CSV or OFX in the file-type dialog, then export. Register the browser download event before the final click.

During collection, this page accepted 7 October 2024 and rejected 6 October as more than two years ago. Preserve the archive's earlier August and September 2024 exports. Re-evaluate the accepted boundary on each collection; the historical date is not a reusable start date.

After a download, the Export control sometimes lost its button name while visible text remained available. Reinspect the page and target the visible control. Do not repeatedly use a stale locator.

## Legacy Mastercard and Home Loan pages

Use **Advanced search**, then **Choose dates**. Fill From and To, then use **Search**. Wait for the new results before exporting CSV and OFX. The legacy page accepted an earlier search boundary than the modern page during collection.

The custom account selector did not reliably update the page when its underlying native select was changed. Open the visible selector and click the displayed account option, then verify the active account.

Selecting Home Loan can open the property overview. Use its **Transactions** tab and **View transaction history** to reach the export page.

UI result counts can include entries omitted from monetary exports. The loan search showed rate and repayment notices; the card search showed fee-saving notices. Compare monetary rows in CSV and OFX rather than requiring the UI result count to match.

## Statement history

Choose the account in **View statements for**, then check each relevant financial year. Modern statement pages and legacy card or loan pages used different year selectors. Wait for the selected year to finish loading before recording "no statements."

Download the original PDF through the bank's statement link or the PDF viewer's download control. Validate its PDF signature, account, issue date, and printed statement period. Do not recreate PDFs from screenshots or extracted text.

Statement calendars differ by account. A June statement can remain the newest Savings or Home Loan PDF while September transactions are already available in structured exports. The next Mastercard statement can extend beyond the transaction cutoff and be unavailable at collection time.

## Browser failures and downloaded files

Chrome's modern export page returned `ERR_BLOCKED_BY_CLIENT` during collection. That error indicated client-side blocking; its exact cause was not established. Retrying did not fix it. The user moved the authenticated session to the in-app browser, where official downloads worked. A browser failure does not establish a bank export limit.

Try a fresh UI export and inspect the result. If needed, use another browser session the user has authenticated and selected. Do not disable extensions or browser protections based on speculation. Keep bank interactions in the supported browser UI; local processing starts after official files are downloaded.

Capture the file returned by each download operation. Check its account and contents before assigning a filename. A stale local Mastercard CSV was once mistaken for a Spending download because it was selected by modification time alone.

## Source interpretation

CSV exports are headerless and have four columns: date, signed AUD amount, description, and running balance. Card balances are blank. Dates use `dd/mm/yyyy`.

The downloaded OFX files used OFX 1.02 SGML, with account IDs, `<STMTTRN>` entries, dates, signed amounts, and memo fields. FITID values were blank in observed card exports. Preserve original bytes and parse the declared encoding.

For Mastercard, a CSV transaction can appear in the following PDF with a later date. One $358 charge dated 10 February in the CSV appeared on 11 February in the next statement. A naive statement-date filter therefore fails even when both sources are complete. Compare payments and cumulative charges, then investigate boundary transactions.

The original Mastercard export's August 2024 to August 2026 filename contained only 35 transactions from 31 July to 13 August 2026. Inspect contents before trusting historical coverage. The repaired collection began with activity in December 2025, consistent with the first available PDF and its zero opening balance.
