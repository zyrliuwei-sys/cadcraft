import { lazy, Suspense, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { track } from '@/lib/track';
import { usePublicConfig } from '@/hooks/use-public-config';
import type { PaymentProvider } from '@/components/payment-provider-modal';
import type { PricingPlan } from '@/components/pricing-table';

const PaymentProviderModal = lazy(() =>
  import('@/components/payment-provider-modal').then((mod) => ({
    default: mod.PaymentProviderModal,
  }))
);

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'waffo',
  'paypal',
  'alipay',
  'wechat',
];

/**
 * Checkout for a pricing card: signs the visitor in first, lets them pick a
 * provider when the admin enabled several, then redirects to the provider.
 * Render `modal` once next to the pricing table.
 */
export function useCheckout({
  backTo,
  returnTo,
}: {
  /** Page to come back to after signing in. */
  backTo: string;
  /** Page to land on after paying; defaults to the current page. */
  returnTo?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: configsData, refetch: refetchConfigs } = usePublicConfig();
  const [modalOpen, setModalOpen] = useState(false);
  // The provider picker (a dialog) loads on first open and stays mounted.
  const [modalMounted, setModalMounted] = useState(false);
  if (modalOpen && !modalMounted) setModalMounted(true);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(() => {
    const configs = configsData ?? {};
    return ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true');
  }, [configsData]);

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider?: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        // Come back to the page the user paid from.
        redirect: returnTo ?? currentPathWithQuery('/settings/billing'),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider?: PaymentProvider) {
    track('begin_checkout', {
      plan: plan.productId ?? '',
      value: (plan.priceInCents ?? 0) / 100,
    });
    setLoadingProvider(provider ?? null);
    checkoutMutation.mutate({ plan, provider });
  }

  async function checkout(plan: PricingPlan) {
    track('plan_click', {
      plan: plan.productId ?? '',
      value: (plan.priceInCents ?? 0) / 100,
      signed_in: session?.user ? 1 : 0,
    });
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery(backTo));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    // A click can land before public config has loaded — fetch it first
    // instead of guessing a provider that may not be configured.
    const cfg = configsData ?? (await refetchConfigs()).data ?? {};
    const enabled = ALL_PROVIDERS.filter((p) => cfg[`${p}_enabled`] === 'true');
    const selectEnabled = cfg.select_payment_enabled === 'true';
    // Unknown → omit it; the server falls back to the admin default provider.
    const defaultProvider = (cfg.default_payment_provider || enabled[0]) as
      | PaymentProvider
      | undefined;

    if (selectEnabled && enabled.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    startCheckout(plan, defaultProvider);
  }

  const modal = modalMounted && (
    <Suspense fallback={null}>
      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={(provider) => {
          if (pendingPlan) startCheckout(pendingPlan, provider);
        }}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </Suspense>
  );

  return { checkout, modal };
}
