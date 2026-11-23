/** Caption helpers: group word timings into cues and export WebVTT / SRT. */
export interface Word {
  text: string;
  start: number;
  end: number;
}
export interface Cue {
  start: number;
  end: number;
  text: string;
}

/** Group words into readable cues (max chars per cue, break on long pauses / sentence ends). */
export function wordsToCues(words: Word[], opts: { maxChars?: number; maxGap?: number } = {}): Cue[] {
  const { maxChars = 42, maxGap = 0.8 } = opts;
  const cues: Cue[] = [];
  let cur: Cue | null = null;
  for (const w of words) {
    if (!w.text) continue;
    const gap = cur ? w.start - cur.end : 0;
    const wouldBe = cur ? cur.text.length + 1 + w.text.length : w.text.length;
    if (cur && (wouldBe > maxChars || gap > maxGap || /[.!?]$/.test(cur.text))) {
      cues.push(cur);
      cur = null;
    }
    if (!cur) cur = { start: w.start, end: w.end, text: w.text };
    else {
      cur.text += ' ' + w.text;
      cur.end = w.end;
    }
  }
  if (cur) cues.push(cur);
  return cues;
}

function stamp(t: number, sep: '.' | ','): string {
  const ms = Math.round(Math.max(0, t) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(ms % 1000, 3)}`;
}

export function toWebVTT(cues: Cue[]): string {
  return 'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${c.text}\n`).join('\n');
}

export function toSRT(cues: Cue[]): string {
  return cues.map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${c.text}\n`).join('\n');
}

export function downloadText(filename: string, text: string, mime = 'text/vtt') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
