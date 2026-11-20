import { describe, it, expect } from 'vitest';
import {
  createTextLayer, createImageLayer, resolveTokens, collectTokens, moveLayer, updateLayer, removeLayer,
  headerToToken, rowsToTokenValues, safeFileName, isEditorDoc, parseCsv, unmatchedTokens, type Layer
} from '../layerModel';

const doc = { width: 1000, height: 800 };

describe('tokens', () => {
  it('resolves known tokens and leaves unknown/empty ones visible', () => {
    expect(resolveTokens('Hi [FIRSTNAME] of [COMPANY] [MISSING]', { FIRSTNAME: 'Ada', COMPANY: '' })).toBe('Hi Ada of [COMPANY] [MISSING]');
    expect(resolveTokens('[firstname]', { FIRSTNAME: 'Ada' })).toBe('Ada');
  });
  it('matches tokens regardless of underscores/case (CSV "First Name" fills [FIRSTNAME])', () => {
    expect(resolveTokens('Hi [FIRSTNAME] / [first_name]', { FIRST_NAME: 'Ada' })).toBe('Hi Ada / Ada');
    expect(resolveTokens('Hi [FIRST_NAME]', { FIRSTNAME: 'Ada' })).toBe('Hi Ada');
  });
  it('reports tokens with no matching column', () => {
    expect(unmatchedTokens(['FIRSTNAME', 'CITY'], ['First Name', 'Company'])).toEqual(['CITY']);
  });
  it('collects distinct tokens from text layers only', () => {
    const layers: Layer[] = [
      createTextLayer(doc, { text: 'A [FIRSTNAME] [COMPANY]' }),
      createTextLayer(doc, { text: '[FIRSTNAME] again [city]' }),
      createImageLayer(doc, 'x', { width: 10, height: 10 })
    ];
    expect(collectTokens(layers)).toEqual(['FIRSTNAME', 'COMPANY', 'CITY']);
  });
});

describe('layers', () => {
  const mk = (): Layer[] => ['a', 'b', 'c'].map(n => createTextLayer(doc, { id: n, name: n }));
  it('reorders', () => {
    expect(moveLayer(mk(), 'a', 'up').map(l => l.id)).toEqual(['b', 'a', 'c']);
    expect(moveLayer(mk(), 'c', 'up').map(l => l.id)).toEqual(['a', 'b', 'c']);
    expect(moveLayer(mk(), 'c', 'bottom').map(l => l.id)).toEqual(['c', 'a', 'b']);
    expect(moveLayer(mk(), 'a', 'top').map(l => l.id)).toEqual(['b', 'c', 'a']);
    expect(moveLayer(mk(), 'zzz', 'up').map(l => l.id)).toEqual(['a', 'b', 'c']);
  });
  it('updates and removes immutably', () => {
    const l = mk();
    const u = updateLayer(l, 'b', { visible: false });
    expect(u[1].visible).toBe(false);
    expect(l[1].visible).toBe(true);
    expect(removeLayer(l, 'b').map(x => x.id)).toEqual(['a', 'c']);
  });
  it('fits images inside the canvas without upscaling', () => {
    const big = createImageLayer(doc, 's', { width: 2000, height: 1000 });
    expect([big.width, big.height]).toEqual([1000, 500]);
    expect([big.x, big.y]).toEqual([0, 150]);
    const small = createImageLayer(doc, 's', { width: 100, height: 50 });
    expect([small.width, small.height]).toEqual([100, 50]);
  });
});

describe('csv batch helpers', () => {
  it('normalises headers and drops blank rows', () => {
    expect(headerToToken(' First Name ')).toBe('FIRST_NAME');
    expect(headerToToken('company')).toBe('COMPANY');
    expect(rowsToTokenValues([{ 'First Name': ' Ada ', Company: 'Acme' }, { 'First Name': '', Company: '' }])).toEqual([{ FIRST_NAME: 'Ada', COMPANY: 'Acme' }]);
  });
  it('makes safe file names', () => {
    expect(safeFileName('Ada Lovelace / Acme?!')).toBe('Ada_Lovelace_Acme');
    expect(safeFileName('???', 'img')).toBe('img');
  });
  it('validates docs', () => {
    expect(isEditorDoc({ width: 1, height: 1, layers: [] })).toBe(true);
    expect(isEditorDoc({ width: 1 })).toBe(false);
    expect(isEditorDoc(null)).toBe(false);
  });
});

describe('parseCsv', () => {
  it('parses headers, quotes, escaped quotes, CRLF and blank lines', () => {
    const csv = '﻿First Name,Company\r\n"Lovelace, Ada","Acme ""Inc"""\r\n\r\nGrace,Navy\n';
    expect(parseCsv(csv)).toEqual([
      { 'First Name': 'Lovelace, Ada', Company: 'Acme "Inc"' },
      { 'First Name': 'Grace', Company: 'Navy' }
    ]);
  });
  it('handles empty input and short rows', () => {
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('a,b\n1')).toEqual([{ a: '1', b: '' }]);
  });
});
