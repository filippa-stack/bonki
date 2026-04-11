import posthog from 'posthog-js';

export const initPostHog = () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) {
    console.warn('[PostHog] VITE_POSTHOG_KEY not set — analytics disabled');
    return;
  }

  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    capture_pageview: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-sensitive]',
    },
    persistence: 'localStorage',
  });
};

export { posthog };
