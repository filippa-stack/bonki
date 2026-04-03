declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function generateEventId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Fire a Meta Pixel event with automatic eventID for CAPI dedup.
 * Returns the generated eventID so it can be forwarded server-side later.
 */
export function trackPixelEvent(
  event: string,
  params?: Record<string, unknown>,
): string | null {
  if (!window.fbq) return null;
  const eventID = generateEventId();
  window.fbq('track', event, params ?? {}, { eventID });
  return eventID;
}
