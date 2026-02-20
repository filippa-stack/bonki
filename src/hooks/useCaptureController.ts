/**
 * CaptureController — drives the sequential screenshot capture loop.
 *
 * Flow:
 *   1. ScreenshotExport page clears state and navigates to the first URL with ?__sc_step=0.
 *   2. This hook, running inside App, detects __sc_step, waits for the
 *      React tree to settle, captures document.documentElement with html2canvas,
 *      stores the result in sessionStorage, and advances to the next step.
 *   3. After all steps, navigates to /screenshot-export?sc_done=1.
 *
 * Guards against double-capture by persisting captured step indices in sessionStorage
 * (survives component re-mounts caused by navigation).
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CAPTURE_QUEUE: {
  label: string; file: string; path: string;
  devState: string | null; skipOnboarding: boolean; devStep?: number;
}[] = [
  // ── Onboarding ────────────────────────────────────────────────────────────
  { label: 'Onboarding',              file: '01-onboarding.png',          path: '/',                              devState: null,                  skipOnboarding: false },
  // ── Home states ────────────────────────────────────────────────────────────
  { label: 'Home – Solo',             file: '02-home-solo.png',           path: '/',                              devState: 'solo',                skipOnboarding: true  },
  { label: 'Home – Paired Idle',      file: '03-home-paired-idle.png',    path: '/',                              devState: 'pairedIdle',          skipOnboarding: true  },
  { label: 'Home – Paired Active',    file: '04-home-paired-active.png',  path: '/',                              devState: 'pairedActive',        skipOnboarding: true  },
  { label: 'Home – Proposal',         file: '05-home-proposal.png',       path: '/',                              devState: 'proposalIncoming',    skipOnboarding: true  },
  { label: 'Home – Waiting',          file: '06-home-waiting.png',        path: '/',                              devState: 'waiting',             skipOnboarding: true  },
  { label: 'Home – Completed',        file: '07-home-completed.png',      path: '/',                              devState: 'completed',           skipOnboarding: true  },
  // ── Categories ────────────────────────────────────────────────────────────
  { label: 'Categories',              file: '08-categories.png',          path: '/categories',                    devState: 'browse',              skipOnboarding: false },
  { label: 'Category – Topic List',   file: '09-category-topics.png',     path: '/category/communication',        devState: 'browse',              skipOnboarding: false },
  // ── Card / Session (4 steps) ──────────────────────────────────────────────
  { label: 'Card – Step 1 (Opening)', file: '10-card-step1.png',          path: '/card/listening-presence',        devState: 'pairedActive',        skipOnboarding: false, devStep: 0 },
  { label: 'Card – Step 2 (Reflect)', file: '11-card-step2.png',          path: '/card/listening-presence',        devState: 'pairedActive',        skipOnboarding: false, devStep: 1 },
  { label: 'Card – Step 3 (Scenario)',file: '12-card-step3.png',          path: '/card/listening-presence',        devState: 'pairedActive',        skipOnboarding: false, devStep: 2 },
  { label: 'Card – Step 4 (Exercise)',file: '13-card-step4.png',          path: '/card/listening-presence',        devState: 'pairedActive',        skipOnboarding: false, devStep: 3 },
  // ── Completion ────────────────────────────────────────────────────────────
  { label: 'Card – Completion',       file: '14-card-completion.png',     path: '/card/listening-presence',        devState: 'completed',           skipOnboarding: false },
  // ── Archive ───────────────────────────────────────────────────────────────
  { label: 'Archive – Empty',         file: '15-archive-empty.png',       path: '/shared',                        devState: 'archiveEmpty',        skipOnboarding: false },
  { label: 'Archive – With History',  file: '16-archive-history.png',     path: '/shared',                        devState: 'archiveWithHistory',  skipOnboarding: false },
];

const RESULTS_KEY = '__sc_results';
const CAPTURED_KEY = '__sc_captured';

export function getStoredResults(): { label: string; file: string; dataUrl: string }[] {
  try { return JSON.parse(sessionStorage.getItem(RESULTS_KEY) || '[]'); } catch { return []; }
}

function getCapturedSteps(): Set<number> {
  try {
    const arr = JSON.parse(sessionStorage.getItem(CAPTURED_KEY) || '[]');
    return new Set<number>(arr);
  } catch { return new Set(); }
}

function markStepCaptured(step: number) {
  const steps = getCapturedSteps();
  steps.add(step);
  sessionStorage.setItem(CAPTURED_KEY, JSON.stringify([...steps]));
}

export function clearStoredResults() {
  sessionStorage.removeItem(RESULTS_KEY);
  sessionStorage.removeItem(CAPTURED_KEY);
}

function buildCaptureUrl(step: number): string {
  const item = CAPTURE_QUEUE[step];
  const params = new URLSearchParams({ __sc_step: String(step) });
  if (item.devState) params.set('devState', item.devState);
  if (item.devStep !== undefined) params.set('__sc_dev_step', String(item.devStep));
  return `${item.path}?${params.toString()}`;
}

export function useCaptureController() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stepStr = searchParams.get('__sc_step');

  useEffect(() => {
    if (stepStr === null) return;

    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step < 0 || step >= CAPTURE_QUEUE.length) return;

    // Guard: skip if already captured (persists across re-mounts)
    if (getCapturedSteps().has(step)) return;
    markStepCaptured(step);

    const item = CAPTURE_QUEUE[step];

    const doCapture = async () => {
      // Wait for React + animations to settle
      await new Promise(r => setTimeout(r, 2500));

      // Skip onboarding overlay if needed
      if (item.skipOnboarding) {
        const skipBtn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('Hoppa'));
        if (skipBtn) {
          (skipBtn as HTMLButtonElement).click();
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Inline computed styles so html2canvas resolves CSS custom properties
      const { default: html2canvas } = await import('html2canvas');

      function inlineComputedStyles(root: HTMLElement) {
        const all = root.querySelectorAll('*') as NodeListOf<HTMLElement>;
        all.forEach((el) => {
          const cs = window.getComputedStyle(el);
          el.style.color = cs.color;
          el.style.backgroundColor = cs.backgroundColor;
          el.style.borderColor = cs.borderColor;
          el.style.fill = cs.fill;
          el.style.stroke = cs.stroke;
        });
      }

      const canvas = await html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f5f5f3',
        scale: 2,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (_doc, el) => {
          inlineComputedStyles(el);
        },
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Store result
      const results = getStoredResults();
      results[step] = { label: item.label, file: item.file, dataUrl };
      sessionStorage.setItem(RESULTS_KEY, JSON.stringify(results));

      // Advance
      const nextStep = step + 1;
      if (nextStep < CAPTURE_QUEUE.length) {
        navigate(buildCaptureUrl(nextStep), { replace: true });
      } else {
        navigate('/screenshot-export?sc_done=1', { replace: true });
      }
    };

    doCapture().catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepStr]);
}
