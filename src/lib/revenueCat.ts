import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const APPLE_API_KEY = 'appl_nPPbYisknZGlswxGmwZZzMUjgWl';

let initialized = false;

export async function initRevenueCat(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Web: skip RevenueCat, web uses Stripe
    return;
  }

  if (initialized) {
    // Already initialized — just update the user ID if it changed
    try {
      await Purchases.logIn({ appUserID: userId });
    } catch (error) {
      console.error('RevenueCat logIn failed:', error);
    }
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.INFO });

    if (Capacitor.getPlatform() === 'ios') {
      await Purchases.configure({ apiKey: APPLE_API_KEY, appUserID: userId });
      initialized = true;
    }
    // Android support added in a later prompt
  } catch (error) {
    console.error('RevenueCat initialization failed:', error);
  }
}

export async function logOutRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !initialized) {
    return;
  }
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('RevenueCat logOut failed:', error);
  }
}
