/**
 * Global motion constants — single source of truth.
 *
 * BEAT values are the only permitted delay increments across the app.
 * Stagger offsets must be multiples of a BEAT.
 * No delay should exceed BEAT_3 * N where N keeps total ≤ 320ms.
 *
 * Easing: cubic-bezier(0.4, 0.0, 0.2, 1) — Material standard ease.
 */

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
