import { describe, it, expect } from 'vitest';
import { evenSize, planTimeline } from '../videoExport';

describe('evenSize', () => {
  it('rounds to even numbers and clamps to a maximum edge', () => {
    expect(evenSize(1081, 721)).toEqual({ width: 1082, height: 722 });
    expect(evenSize(3840, 2160)).toEqual({ width: 1920, height: 1080 });
    expect(evenSize(1, 1)).toEqual({ width: 2, height: 2 });
  });
});

describe('planTimeline', () => {
  it('plans hold frames and cross-fades with continuous, gap-free timestamps', () => {
    const plan = planTimeline(3, { secondsPerSlide: 2, fps: 10, fadeSeconds: 0.4 });
    // 3 holds + 2 fades x 4 frames
    expect(plan.filter(f => f.next === undefined).length).toBe(3);
    expect(plan.filter(f => f.next !== undefined).length).toBe(8);
    // contiguous timeline
    for (let i = 1; i < plan.length; i++) expect(plan[i].time).toBeCloseTo(plan[i - 1].time + plan[i - 1].duration, 6);
    // every slide gets secondsPerSlide in total (hold + the fade that follows)
    const total = plan[plan.length - 1].time + plan[plan.length - 1].duration;
    expect(total).toBeCloseTo(3 * 2, 6);
    // fade mix rises 0..1 exclusive and points at the next slide
    const fade = plan.filter(f => f.slide === 0 && f.next === 1).map(f => f.mix!);
    expect(fade).toEqual([...fade].sort((a, b) => a - b));
    expect(fade[0]).toBeGreaterThan(0);
    expect(fade[fade.length - 1]).toBeLessThan(1);
  });

  it('handles hard cuts, one slide, and none', () => {
    expect(planTimeline(2, { fadeSeconds: 0 }).every(f => f.next === undefined)).toBe(true);
    expect(planTimeline(1)).toHaveLength(1);
    expect(planTimeline(0)).toEqual([]);
  });
});
