/**
 * Determines whether a product's free card should be available to this user.
 * Based on the audience they selected during onboarding.
 *
 * Returns true if:
 * - The product matches their onboarding choice, OR
 * - No onboarding audience is stored (legacy user fallback)
 */

const AUDIENCE_PRODUCT_MAP: Record<string, string> = {
  young: 'jag_i_mig',
  middle: 'jag_med_andra',
  teen: 'jag_i_varlden',
  couple: 'still_us',
};

export function isProductFreeForUser(productId: string): boolean {
  const audience = localStorage.getItem('bonki-onboarding-audience');
  if (!audience) return true;
  return AUDIENCE_PRODUCT_MAP[audience] === productId;
}
