import { getPricingProduct } from '@/config/pricing';
import { safeInternalPath } from '@/lib/redirect';

export const CHECKOUT_INTENT_KEY = 'cc_checkout_intent';
export const CHECKOUT_INTENT_TTL = 30 * 60_000;
const KEYS = ['checkout', 'checkout_token', 'checkout_return'];
const ORIGIN = 'https://checkout.invalid';

export interface CheckoutIntent {
  productId: string;
  source: string;
  returnTo: string;
  token: string;
  createdAt: number;
}

export function checkoutSource(value?: string | null) {
  return value && /^[a-z0-9_-]{1,48}$/.test(value) ? value : 'pricing';
}

export function cleanCheckoutPath(path: string) {
  const url = new URL(safeInternalPath(path) ?? '/pricing', ORIGIN);
  for (const key of KEYS) url.searchParams.delete(key);
  return url.pathname + url.search + url.hash;
}

export function checkoutCallback(path: string, intent: CheckoutIntent) {
  const url = new URL(cleanCheckoutPath(path), ORIGIN);
  url.searchParams.set('checkout', intent.productId);
  url.searchParams.set('checkout_token', intent.token);
  url.searchParams.set('checkout_return', cleanCheckoutPath(intent.returnTo));
  url.searchParams.set('upgrade_from', intent.source);
  return url.pathname + url.search + url.hash;
}

export function parseCheckoutIntent(path: string): CheckoutIntent | null {
  const url = new URL(path, ORIGIN);
  const productId = url.searchParams.get('checkout');
  if (!productId || !getPricingProduct(productId)) return null;
  return {
    productId,
    source: checkoutSource(url.searchParams.get('upgrade_from')),
    returnTo: cleanCheckoutPath(
      safeInternalPath(url.searchParams.get('checkout_return')) ??
        '/settings/billing'
    ),
    token: url.searchParams.get('checkout_token') ?? '',
    createdAt: 0,
  };
}

/** Only an unexpired intent created in this tab may auto-continue after auth. */
export function canResumeCheckout(
  intent: CheckoutIntent,
  saved: string | null,
  now = Date.now()
) {
  if (!saved || !intent.token) return false;
  try {
    const pending: CheckoutIntent = JSON.parse(saved);
    return (
      pending.token === intent.token &&
      pending.productId === intent.productId &&
      pending.source === intent.source &&
      pending.returnTo === intent.returnTo &&
      Number.isFinite(pending.createdAt) &&
      now >= pending.createdAt &&
      now - pending.createdAt < CHECKOUT_INTENT_TTL
    );
  } catch {
    return false;
  }
}
