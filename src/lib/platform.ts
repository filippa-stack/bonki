import { Capacitor } from '@capacitor/core';

export const isIOSNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const HIDDEN_PRODUCT_IDS_NATIVE = ['sexualitetskort'] as const;

export const isProductHiddenOnPlatform = (productId: string): boolean =>
  Capacitor.isNativePlatform() &&
  (HIDDEN_PRODUCT_IDS_NATIVE as readonly string[]).includes(productId);
