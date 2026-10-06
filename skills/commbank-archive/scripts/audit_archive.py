"""Read-only checks for the numbered CommBank source archive."""

import argparse
from collections import Counter
import csv
from datetime import date, datetime
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import re
import sys


ACCOUNT_SUFFIXES = {
    'spending-offset': '6167',
    'savings-offset': '9239',
    'mastercard-ultimate': '6895',
    'home-loan': '0281',
}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as handle:
        rows = [tuple(row) for row in csv.reader(handle) if row]
    for row in rows:
        if len(row) != 4:
            raise ValueError('Expected four headerless CSV columns')
        datetime.strptime(row[0], '%d/%m/%Y')
        Decimal(row[1])
        if row[3]:
            Decimal(row[3])
    return rows


def csv_date(row):
    return datetime.strptime(row[0], '%d/%m/%Y').date()


def read_ofx(path):
    raw = path.read_bytes()
    charset = re.search(rb'CHARSET:([^\r\n]+)', raw[:1000])
    encoding = re.search(rb'ENCODING:([^\r\n]+)', raw[:1000])
    codec = 'utf-8' if encoding and encoding[1].upper() in {b'UTF-8', b'UNICODE'} else 'cp1252'
    if charset and charset[1].isdigit():
        codec = 'cp' + charset[1].decode('ascii')
    text = raw.decode(codec)
    account = re.search(r'<ACCTID>([^<\r\n]+)', text)
    if not account:
        raise ValueError('OFX account ID is missing')
    entries = []
    for block in re.findall(r'<STMTTRN>(.*?)</STMTTRN>', text, re.S):
        posted = re.search(r'<DTPOSTED>(\d{8})', block)
        amount = re.search(r'<TRNAMT>([^<\r\n]+)', block)
        if not posted or not amount:
            raise ValueError('OFX transaction date or amount is missing')
        entries.append((datetime.strptime(posted[1], '%Y%m%d').date(), Decimal(amount[1])))
    return account[1].strip(), Counter(entries)


def paired_ofx(path):
    match = re.match(r'^(\d+)a_(.*)\.csv$', path.name)
    if match:
        return path.with_name(f'{match[1]}b_{match[2]}.ofx')
    return path.with_suffix('.ofx')


def audit(root, cutoff, baseline=None):
    errors = []
    files = sorted(path for path in root.iterdir() if path.suffix.lower() in {'.csv', '.ofx', '.pdf'})
    if not files:
        errors.append('No banking source files found in the archive root')
    inventory = []
    accounts = {}
    pairs = []
    paired = set()
    for path in files:
        if path.is_symlink() or not path.is_file():
            errors.append(f'{path.name}: expected a regular file')
            continue
        inventory.append({'file': path.name, 'bytes': path.stat().st_size, 'sha256': sha256(path)})
        if path.suffix.lower() == '.pdf':
            if not path.read_bytes().startswith(b'%PDF'):
                errors.append(f'{path.name}: invalid PDF signature')
            continue
        if path.suffix.lower() != '.csv':
            continue
        try:
            match = re.fullmatch(r'(?:\d+a_)?cba_([a-z-]+)_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.csv', path.name)
            if not match:
                raise ValueError('Unrecognized export filename')
            account, start, end = match[1], date.fromisoformat(match[2]), date.fromisoformat(match[3])
            if account not in ACCOUNT_SUFFIXES:
                raise ValueError('Account outside the established four-account scope')
            if start > end or end > cutoff:
                raise ValueError('Requested window is reversed or exceeds the cutoff')
            rows = read_csv(path)
            dates = [csv_date(row) for row in rows]
            if any(day < start or day > end or day > cutoff for day in dates):
                raise ValueError('Transaction date outside the requested window or cutoff')
            ofx = paired_ofx(path)
            if not ofx.is_file() or ofx.is_symlink():
                raise ValueError('Matching regular OFX file is missing')
            ofx_account, ofx_entries = read_ofx(ofx)
            if not ofx_account.endswith(ACCOUNT_SUFFIXES[account]):
                raise ValueError('OFX account suffix does not match the filename account')
            if Counter((csv_date(row), Decimal(row[1])) for row in rows) != ofx_entries:
                raise ValueError('CSV and OFX transaction dates or signed amounts differ')
            paired.add(ofx.name)
            accounts.setdefault(account, Counter())
            accounts[account] |= Counter(rows)
            pairs.append({'csv': path.name, 'ofx': ofx.name, 'rows': len(rows),
                          'first_transaction': str(min(dates)) if dates else None,
                          'last_transaction': str(max(dates)) if dates else None})
        except (ValueError, OSError, UnicodeError, LookupError, ArithmeticError) as error:
            errors.append(f'{path.name}: {error}')
    for path in files:
        if path.suffix.lower() == '.ofx' and path.name not in paired:
            errors.append(f'{path.name}: OFX not validated with a matching CSV')
    if baseline is not None:
        old = baseline['files'] if isinstance(baseline, dict) else baseline
        current = {item['file']: item for item in inventory}
        for item in old:
            if Path(item['file']).suffix.lower() not in {'.csv', '.ofx', '.pdf'}:
                continue
            if item['file'] not in current:
                errors.append(f"{item['file']}: original banking file is missing")
            elif current[item['file']]['sha256'] != item['sha256']:
                errors.append(f"{item['file']}: original banking file changed")
    coverage = {}
    for account, counter in accounts.items():
        days = [csv_date(row) for row in counter]
        coverage[account] = {'unique_structured_rows': counter.total(),
                             'first_transaction': str(min(days)) if days else None,
                             'last_transaction': str(max(days)) if days else None}
    return {'cutoff': str(cutoff), 'ok': not errors, 'errors': errors,
            'files': inventory, 'verified_pairs': pairs, 'coverage': coverage,
            'limits': 'PDF signatures only; full-row overlap counts are diagnostics, not bank availability or importer identity.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--cutoff', required=True, type=date.fromisoformat)
    parser.add_argument('--baseline', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    if not args.archive.is_dir() or args.archive.is_symlink():
        parser.error('Archive must be a regular directory')
    if args.report and args.report.resolve().is_relative_to(args.archive.resolve()):
        parser.error('Write the report outside the inspected archive, then copy it into audit after verification')
    baseline = json.loads(args.baseline.read_text()) if args.baseline else None
    report = audit(args.archive, args.cutoff, baseline)
    rendered = json.dumps(report, indent=2) + '\n'
    if args.report:
        args.report.write_text(rendered)
    print(json.dumps({key: report[key] for key in ('ok', 'errors', 'coverage')}, indent=2))
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
