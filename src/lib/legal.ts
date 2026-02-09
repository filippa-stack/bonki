export const TERMS_VERSION = 'v1';
export const PRIVACY_VERSION = 'v1';

export interface LegalConsent {
  terms: { acceptedAt: string | null; version: string };
  privacy: { acceptedAt: string | null; version: string };
}

export function createEmptyConsent(): LegalConsent {
  return {
    terms: { acceptedAt: null, version: TERMS_VERSION },
    privacy: { acceptedAt: null, version: PRIVACY_VERSION },
  };
}

export function hasAcceptedTerms(legal: LegalConsent | undefined | null): boolean {
  if (!legal) return false;
  return (
    legal.terms.acceptedAt !== null &&
    legal.terms.version === TERMS_VERSION &&
    legal.privacy.acceptedAt !== null &&
    legal.privacy.version === PRIVACY_VERSION
  );
}
