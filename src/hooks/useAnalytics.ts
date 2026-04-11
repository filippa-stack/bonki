import { posthog } from '@/lib/posthog';

export function useAnalytics() {
  const track = (event: string, properties?: Record<string, unknown>) => {
    posthog.capture(event, properties);
  };

  const identify = (userId: string, traits?: Record<string, unknown>) => {
    posthog.identify(userId, traits);
  };

  return { track, identify };
}
