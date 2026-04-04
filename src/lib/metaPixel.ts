import { supabase } from '@/integrations/supabase/client';

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

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Fire a Meta Pixel event with automatic eventID for CAPI dedup.
 * Also sends the event server-side via the meta-capi edge function.
 * Returns the generated eventID so it can be forwarded server-side later.
 */
export function trackPixelEvent(
  event: string,
  params?: Record<string, unknown>,
): string | null {
  const eventID = generateEventId();

  // Browser pixel
  if (window.fbq) {
    window.fbq('track', event, params ?? {}, { eventID });
  }

  // Server-side CAPI (fire-and-forget)
  try {
    const capiBody: Record<string, unknown> = {
      event_name: event,
      event_id: eventID,
      event_source_url: window.location.href,
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
    };
    if (params && Object.keys(params).length > 0) {
      capiBody.custom_data = params;
    }

    // Include auth token if user is logged in
    supabase.auth.getSession().then(({ data }) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (data.session?.access_token) {
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      fetch(
        `https://${projectId}.supabase.co/functions/v1/meta-capi`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(capiBody),
        }
      ).catch(() => {
        // Silent — CAPI must never break the app
      });
    }).catch(() => {
      // Silent — CAPI must never break the app
    });
  } catch {
    // Silent — CAPI must never break the app
  }

  return eventID;
}
