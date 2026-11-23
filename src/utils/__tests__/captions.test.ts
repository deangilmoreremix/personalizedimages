import { describe, it, expect } from 'vitest';
import { wordsToCues, toWebVTT, toSRT } from '../captions';

const w = (text: string, start: number, end: number) => ({ text, start, end });

describe('captions', () => {
  it('groups words into cues, splitting on sentence ends, gaps and length', () => {
    const cues = wordsToCues([w('Ask', 0, 0.3), w('not.', 0.3, 0.7), w('What', 0.8, 1.1), w('your', 1.1, 1.3), w('country', 3.0, 3.4)]);
    expect(cues.map(c => c.text)).toEqual(['Ask not.', 'What your', 'country']);
    const long = wordsToCues(Array.from({ length: 20 }, (_, i) => w('word', i * 0.2, i * 0.2 + 0.15)), { maxChars: 20 });
    expect(long.every(c => c.text.length <= 20)).toBe(true);
  });

  it('formats WebVTT with dot millis and a header', () => {
    expect(toWebVTT([{ start: 0, end: 1.5, text: 'Hi' }, { start: 3661.25, end: 3662, text: 'Bye' }])).toBe(
      'WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.500\nHi\n\n2\n01:01:01.250 --> 01:01:02.000\nBye\n'
    );
  });

  it('formats SRT with comma millis', () => {
    expect(toSRT([{ start: 0.5, end: 2, text: 'Hello' }])).toBe('1\n00:00:00,500 --> 00:00:02,000\nHello\n');
  });

  it('ignores empty words and handles no input', () => {
    expect(wordsToCues([w('', 0, 1)])).toEqual([]);
    expect(wordsToCues([])).toEqual([]);
  });
});
