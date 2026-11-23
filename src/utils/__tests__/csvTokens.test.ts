import { describe, it, expect } from 'vitest';
import { parseCsv } from '../csv';
import { resolveTokens, unmatchedTokens, compactKey } from '../tokenText';

describe('parseCsv', () => {
  it('handles quotes, commas in fields, CRLF, BOM and blank lines', () => {
    expect(parseCsv('﻿First Name,Company\r\n"Lovelace, Ada","Acme ""Inc"""\r\n\r\nGrace,Navy\n')).toEqual([
      { 'First Name': 'Lovelace, Ada', Company: 'Acme "Inc"' },
      { 'First Name': 'Grace', Company: 'Navy' }
    ]);
  });
  it('does not drop rows whose quoted fields contain commas (old split(",") parsers did)', () => {
    expect(parseCsv('name,company\n"Grace","Navy, Inc"\nLinus,Penguin')).toHaveLength(2);
  });
});

describe('resolveTokens', () => {
  it('matches ignoring case, spaces and underscores', () => {
    expect(resolveTokens('[FIRSTNAME] [first_name] [Company]', { 'First Name': 'Ada', COMPANY: 'Acme' })).toBe('Ada Ada Acme');
  });
  it('leaves unknown/empty tokens visible and is safe with regex-special column names', () => {
    expect(resolveTokens('Hi [NAME] [OTHER]', { NAME: '', '(weird[': 'x' })).toBe('Hi [NAME] [OTHER]');
  });
  it('supports {{TOKEN}} and {TOKEN} only when asked', () => {
    const v = { company: 'Acme' };
    expect(resolveTokens('{{COMPANY}} {company} [COMPANY]', v)).toBe('{{COMPANY}} {company} Acme');
    expect(resolveTokens('{{ COMPANY }} {company} [COMPANY]', v, { curly: true })).toBe('Acme Acme Acme');
  });
  it('reports unmatched tokens', () => {
    expect(compactKey('First_Name')).toBe('FIRSTNAME');
    expect(unmatchedTokens(['FIRSTNAME', 'CITY'], ['First Name'])).toEqual(['CITY']);
  });
});
