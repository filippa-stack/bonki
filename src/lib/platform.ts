import { Capacitor } from '@capacitor/core';

export const isIOSNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

/**
 * True on Android native builds (Capacitor). Used to hide native IAP entry points
 * until Google Play Billing is wired in a future release.
 */
export const isAndroidNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export const HIDDEN_PRODUCT_IDS_NATIVE = ['sexualitetskort'] as const;

export const isProductHiddenOnPlatform = (productId: string): boolean =>
  Capacitor.isNativePlatform() &&
  (HIDDEN_PRODUCT_IDS_NATIVE as readonly string[]).includes(productId);
