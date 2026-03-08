import { supabase } from '@/integrations/supabase/client';

/**
 * Fire-and-forget onboarding funnel event.
 *
 * Event types (in order):
 *   onboarding_start        – user sees slide 0
 *   onboarding_slide_1      – user reaches slide 1
 *   onboarding_slide_2      – user reaches slide 2
 *   onboarding_complete      – user taps "Utforska biblioteket" / completes onboarding
 *   onboarding_skip          – user taps "Hoppa över"
 *   lobby_view               – user lands on ProductLibrary
 *   product_home_view        – user opens a product home
 *   first_session_start      – user starts their very first session
 */
export async function trackOnboardingEvent(
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Try to get couple_space_id (may not exist yet during early onboarding)
    const { data: spaceData } = await supabase.rpc('get_current_couple_space_id');
    const coupleSpaceId = spaceData || null;

    await supabase.from('onboarding_events').insert({
      user_id: user.id,
      couple_space_id: coupleSpaceId,
      event_type: eventType,
      metadata,
    } as any);
  } catch {
    // Silent fail — tracking must never break the app
  }
}
