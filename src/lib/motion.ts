/**
 * Global motion constants — single source of truth.
 *
 * THREE canonical durations:
 *   PRESS    → 120ms  (tactile feedback, scale 0.98)
 *   PAGE     → 280ms  (page transitions, navigations)
 *   EMOTION  → 320ms  (fade-ins, reveals, emotional beats)
 *
 * No bounce. No spring. No overshoot.
 *
 * BEAT values are the only permitted delay increments.
 * Stagger offsets must be multiples of a BEAT.
 */

/** Press feedback duration (120ms) */
export const PRESS = 0.12;

/** Page transition duration (280ms) */
export const PAGE = 0.28;

/** Emotional fade-in duration (320ms) */
export const EMOTION = 0.32;

/** 60ms — first stagger beat */
export const BEAT_1 = 0.06;

/** 120ms — second stagger beat */
export const BEAT_2 = 0.12;

/** 180ms — third stagger beat */
export const BEAT_3 = 0.18;

/** Global easing curve — use for all transitions */
export const EASE = [0.4, 0.0, 0.2, 1] as const;

/** Ease-in variant for exit transitions */
export const EASE_IN = [0.4, 0.0, 1.0, 1] as const;
