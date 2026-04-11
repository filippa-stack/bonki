import posthog from 'posthog-js';

export const initPostHog = () => {
  posthog.init('phc_w5wABbJBgmrRGDGsZX4GaGYovzvt2qW6is7CXo5Jrxcp', {
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
