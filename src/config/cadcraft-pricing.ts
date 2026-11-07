import { pricingCatalog } from './pricing';

const usd = (cents: number) => `$${cents / 100}`;

// Presentation only: checkout, subscription prices and payment logic stay in
// the existing authoritative catalog and are not changed by this module.
export const cadcraftPriceText = {
  monthly: usd(pricingCatalog.cad_pro_monthly.priceInCents),
  yearly: usd(pricingCatalog.cad_pro_yearly.priceInCents),
  annualMonthly: usd(pricingCatalog.cad_pro_monthly.priceInCents * 12),
};
