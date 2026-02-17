import { supabase } from '@/integrations/supabase/client';

/**
 * Fire-and-forget helper to trigger email notification via edge function.
 * Errors are silently logged — email is best-effort, never blocks UI.
 */
export async function notifyPartnerByEmail(params: {
  type: 'proposal' | 'shared_reflection';
  couple_space_id: string;
  receiver_user_id: string;
  proposal_id?: string;
  note_id?: string;
}) {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: params,
    });
  } catch (err) {
    console.warn('[email-notify] Failed (non-blocking):', err);
  }
}
