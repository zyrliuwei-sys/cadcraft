import { useRouter } from '@/core/i18n/navigation';
import { pricingCatalog } from '@/config/pricing';
import { m } from '@/paraglide/messages.js';
import { useCheckout } from '@/hooks/use-checkout';
import { PageHero } from '@/blocks/cad-doc';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// $4.9 rather than $4.90; whole dollars stay $29.
function usd(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const FREE_ID = 'free';

export function CadPricingPage() {
  const router = useRouter();
  const { checkout, modal } = useCheckout({
    backTo: '/pricing',
    returnTo: '/online?pro=welcome',
  });

  const freePlan: PricingPlan = {
    id: FREE_ID,
    name: m['cad.pricing.free'](),
    description: m['cad.pricing.free_desc'](),
    price: '$0',
    buttonText: m['cad.pricing.free_cta'](),
    features: [
      m['cad.pricing.f_editor'](),
      m['cad.pricing.f_autosave'](),
      m['cad.pricing.f_export'](),
      m['cad.pricing.f_desktop'](),
    ],
  };

  const proFeatures = [
    m['cad.pricing.f_everything'](),
    m['cad.pricing.f_cloud'](),
    m['cad.pricing.f_unlimited'](),
    m['cad.pricing.f_history'](),
    m['cad.pricing.f_share'](),
  ];

  function pro(productId: string): PricingPlan {
    const product = pricingCatalog[productId];
    const monthly = pricingCatalog.cad_pro_monthly.priceInCents;
    const yearly = product.plan?.interval === 'year';
    return {
      id: productId,
      name: m['cad.pricing.pro'](),
      description: yearly
        ? m['cad.pricing.billed_yearly']({ price: usd(product.priceInCents) })
        : m['cad.pricing.pro_desc'](),
      price: usd(
        yearly ? Math.round(product.priceInCents / 12) : product.priceInCents
      ),
      originalPrice: yearly ? usd(monthly) : undefined,
      interval: m['cad.pricing.per_month'](),
      featured: true,
      badge: yearly ? m['cad.pricing.save']() : undefined,
      buttonText: m['cad.pricing.pro_cta'](),
      features: proFeatures,
      productId,
      productName: product.productName,
      priceInCents: product.priceInCents,
      currency: product.currency,
      credits: product.credits,
      plan: product.plan,
    };
  }

  const groups: PricingGroup[] = [
    {
      key: 'yearly',
      label: m['cad.pricing.yearly'](),
      badge: m['cad.pricing.save'](),
      plans: [freePlan, pro('cad_pro_yearly')],
    },
    {
      key: 'monthly',
      label: m['cad.pricing.monthly'](),
      plans: [freePlan, pro('cad_pro_monthly')],
    },
  ];

  const faq = [
    [m['cad.pricing.q1'](), m['cad.pricing.a1']()],
    [m['cad.pricing.q2'](), m['cad.pricing.a2']()],
    [m['cad.pricing.q3'](), m['cad.pricing.a3']()],
    [m['cad.pricing.q4'](), m['cad.pricing.a4']()],
  ];

  return (
    <>
      <PageHero
        eyebrow={m['cad.pricing.eyebrow']()}
        title={m['cad.pricing.title']()}
        lead={m['cad.pricing.lead']()}
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <PricingTable
          groups={groups}
          defaultGroup="yearly"
          onCheckout={(plan) =>
            plan.id === FREE_ID ? router.push('/online') : checkout(plan)
          }
        />
        <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed">
          {m['cad.pricing.dwg_note']()}
        </p>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed">
          {m['cad.pricing.note']()}
        </p>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <h2 className="font-display text-3xl font-semibold lg:col-span-4">
            {m['cad.pricing.faq_title']()}
          </h2>
          <Accordion className="border-foreground/80 border-t lg:col-span-8">
            {faq.map(([q, a]) => (
              <AccordionItem key={q} value={q} className="border-b">
                <AccordionTrigger className="py-5 text-left text-[17px] font-semibold hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent
                  keepMounted
                  className="text-muted-foreground pb-6 text-base leading-relaxed"
                >
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {modal}
    </>
  );
}
