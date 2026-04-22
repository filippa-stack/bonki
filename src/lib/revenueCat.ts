import { Capacitor } from '@capacitor/core';
import type { CustomerInfo } from '@revenuecat/purchases-capacitor';
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

export interface PurchaseResult {
  success: boolean;
  cancelled: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

/**
 * Initiate native iOS purchase via RevenueCat.
 * productId: the Supabase products.id value (e.g. 'jag_i_mig', 'still_us').
 * The RevenueCat Offering's package identifiers must match these ids exactly.
 * Returns a result indicating success, cancellation, or error. Never throws.
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, cancelled: false, error: 'Not a native platform' };
  }

  try {
    const offeringsResult = await Purchases.getOfferings();
    const offering = offeringsResult.current;
    if (!offering) {
      return { success: false, cancelled: false, error: 'No current offering available' };
    }

    const pkg = offering.availablePackages.find((p) => p.identifier === productId);
    if (!pkg) {
      return { success: false, cancelled: false, error: `Package not found: ${productId}` };
    }

    const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });
    return { success: true, cancelled: false, customerInfo: purchaseResult.customerInfo };
  } catch (err: unknown) {
    const error = err as { userCancelled?: boolean; message?: string };
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    console.error('RevenueCat purchase failed:', err);
    return { success: false, cancelled: false, error: error.message ?? 'Purchase failed' };
  }
}
