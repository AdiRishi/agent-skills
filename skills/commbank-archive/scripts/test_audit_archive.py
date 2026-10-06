from datetime import date
from pathlib import Path
import tempfile
import unittest
import csv

from audit_archive import audit


class ArchiveAuditTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.cutoff = date(2026, 9, 30)

    def pair(self, number='081', start='2026-09-01', end='2026-09-30', rows=None, suffix='6167'):
        rows = rows or [('28/09/2026', '-10.00', 'Example payment', '+90.00')]
        with (self.root / f'{number}a_cba_spending-offset_{start}_{end}.csv').open('w', newline='') as handle:
            csv.writer(handle).writerows(rows)
        transactions = ''.join(
            f'<STMTTRN><DTPOSTED>{day[6:10]}{day[3:5]}{day[0:2]}\n<TRNAMT>{amount}\n</STMTTRN>'
            for day, amount, _, _ in rows)
        (self.root / f'{number}b_cba_spending-offset_{start}_{end}.ofx').write_text(
            f'OFXHEADER:100\nENCODING:USASCII\nCHARSET:1252\n<OFX><ACCTID>0000{suffix}\n{transactions}</OFX>')

    def test_overlaps_keep_legitimate_identical_payments(self):
        row = ('28/09/2026', '-10.00', 'Example payment', '')
        self.pair(rows=[row, row])
        self.pair(number='082', start='2026-09-15', rows=[row])
        report = audit(self.root, self.cutoff)
        self.assertTrue(report['ok'])
        self.assertEqual(report['coverage']['spending-offset']['unique_structured_rows'], 2)

    def test_original_file_tampering_prevents_merge(self):
        self.pair()
        baseline = audit(self.root, self.cutoff)
        path = next(self.root.glob('*.csv'))
        path.write_text(path.read_text().replace('Example payment', 'Changed description'))
        report = audit(self.root, self.cutoff, baseline)
        self.assertFalse(report['ok'])
        self.assertTrue(any('original banking file changed' in error for error in report['errors']))

    def test_missing_original_file_prevents_merge(self):
        self.pair()
        baseline = audit(self.root, self.cutoff)
        next(self.root.glob('*.csv')).unlink()
        report = audit(self.root, self.cutoff, baseline)
        self.assertFalse(report['ok'])
        self.assertTrue(any('original banking file is missing' in error for error in report['errors']))

    def test_csv_ofx_amount_difference_is_rejected(self):
        self.pair()
        path = next(self.root.glob('*.ofx'))
        path.write_text(path.read_text().replace('-10.00', '-11.00'))
        report = audit(self.root, self.cutoff)
        self.assertFalse(report['ok'])
        self.assertTrue(any('signed amounts differ' in error for error in report['errors']))

    def test_wrong_account_download_is_rejected(self):
        self.pair(suffix='9239')
        report = audit(self.root, self.cutoff)
        self.assertFalse(report['ok'])
        self.assertTrue(any('account suffix' in error for error in report['errors']))

    def test_transaction_after_cutoff_is_rejected(self):
        self.pair(rows=[('01/10/2026', '-10.00', 'Example payment', '+90.00')])
        report = audit(self.root, self.cutoff)
        self.assertFalse(report['ok'])
        self.assertTrue(any('outside the requested window or cutoff' in error for error in report['errors']))

    def test_html_masquerading_as_pdf_is_rejected(self):
        (self.root / '083_cba_spending-offset_statement.pdf').write_text('<html>Sign in</html>')
        self.assertFalse(audit(self.root, self.cutoff)['ok'])

    def test_wrong_empty_directory_cannot_pass_verification(self):
        self.assertFalse(audit(self.root, self.cutoff)['ok'])


if __name__ == '__main__':
    unittest.main()
