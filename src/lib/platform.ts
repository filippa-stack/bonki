import { Capacitor } from '@capacitor/core';

export const isIOSNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const HIDDEN_PRODUCT_IDS_IOS = ['sexualitetskort'] as const;

export const isProductHiddenOnPlatform = (productId: string): boolean =>
  isIOSNative() && (HIDDEN_PRODUCT_IDS_IOS as readonly string[]).includes(productId);
