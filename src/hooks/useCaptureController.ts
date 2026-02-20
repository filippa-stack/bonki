/**
 * CaptureController — drives the sequential screenshot capture loop.
 *
 * Flow:
 *   1. ScreenshotExport page writes CAPTURE_QUEUE to sessionStorage and
 *      navigates to the first URL with ?__sc_step=0.
 *   2. This hook, running inside App, detects __sc_step, waits for the
 *      React tree to settle, captures document.body with html2canvas,
 *      stores the result, and advances to the next step.
 *   3. After all steps, navigates to /screenshot-export?sc_done=1.
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CAPTURE_QUEUE = [
  { label: 'Onboarding',            file: '01-onboarding.png',       path: '/',           devState: null,                skipOnboarding: false },
  { label: 'Home – Solo',           file: '02-home-solo.png',        path: '/',           devState: 'solo',             skipOnboarding: true  },
  { label: 'Home – Paired Idle',    file: '03-home-paired-idle.png', path: '/',           devState: 'pairedIdle',       skipOnboarding: true  },
  { label: 'Home – Paired Active',  file: '04-home-paired-active.png',path: '/',          devState: 'pairedActive',     skipOnboarding: true  },
  { label: 'Home – Waiting',        file: '05-home-waiting.png',     path: '/',           devState: 'waiting',          skipOnboarding: true  },
  { label: 'Home – Completed',      file: '06-home-completed.png',   path: '/',           devState: 'completed',        skipOnboarding: true  },
  { label: 'Categories (Browse)',   file: '07-categories.png',       path: '/categories', devState: 'browse',           skipOnboarding: false },
  { label: 'Archive – Empty',       file: '08-archive-empty.png',    path: '/saved',      devState: 'archiveEmpty',     skipOnboarding: false },
  { label: 'Archive – With History',file: '09-archive-history.png',  path: '/saved',      devState: 'archiveWithHistory', skipOnboarding: false },
];

const RESULTS_KEY = '__sc_results';

export function getStoredResults(): { label: string; file: string; dataUrl: string }[] {
  try { return JSON.parse(sessionStorage.getItem(RESULTS_KEY) || '[]'); } catch { return []; }
}

export function clearStoredResults() {
  sessionStorage.removeItem(RESULTS_KEY);
}

function buildCaptureUrl(step: number): string {
  const item = CAPTURE_QUEUE[step];
  const params = new URLSearchParams({ __sc_step: String(step) });
  if (item.devState) params.set('devState', item.devState);
  return `${item.path}?${params.toString()}`;
}

export function useCaptureController() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const runningRef = useRef(false);

  const stepStr = searchParams.get('__sc_step');

  useEffect(() => {
    if (stepStr === null) return;
    if (runningRef.current) return;
    runningRef.current = true;

    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step < 0 || step >= CAPTURE_QUEUE.length) return;

    const item = CAPTURE_QUEUE[step];

    const doCapture = async () => {
      // Wait for React + animations
      await new Promise(r => setTimeout(r, 2200));

      // Skip onboarding if needed
      if (item.skipOnboarding) {
        const skipBtn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('Hoppa'));
        if (skipBtn) {
          (skipBtn as HTMLButtonElement).click();
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Capture
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: false,
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
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Store
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
