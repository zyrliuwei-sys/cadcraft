import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authClient, useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { getPricingProduct } from '@/config/pricing';
import { apiPost } from '@/lib/api-client';
import {
  canResumeCheckout,
  CHECKOUT_INTENT_KEY,
  checkoutCallback,
  checkoutSource,
  cleanCheckoutPath,
  parseCheckoutIntent,
  type CheckoutIntent,
} from '@/lib/checkout-intent';
import { currentPathWithQuery } from '@/lib/redirect';
import { track } from '@/lib/track';
import { m } from '@/paraglide/messages.js';
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
type Context = { source: string; returnTo: string };

function catalogPlan(productId: string): PricingPlan | null {
  const p = getPricingProduct(productId);
  return p
    ? {
        id: p.productId,
        productId: p.productId,
        name: p.planName,
        productName: p.productName,
        price: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: p.currency,
        }).format(p.priceInCents / 100),
        priceInCents: p.priceInCents,
        currency: p.currency,
        credits: p.credits,
        creditsValidDays: p.creditsValidDays,
        plan: p.plan,
        features: [],
      }
    : null;
}

/** Auth return URLs carry only catalog IDs; prices always come from the server. */
export function useCheckout({
  backTo,
  returnTo,
  source,
  resume = false,
}: {
  backTo: string;
  returnTo?: string;
  source?: string;
  /** Only the destination pricing page consumes a pending checkout. */
  resume?: boolean;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: configsData, refetch: refetchConfigs } = usePublicConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);
  const [busy, setBusy] = useState(false);
  const [resumePlan, setResumePlan] = useState<PricingPlan | null>(null);
  const contextRef = useRef<Context>({
    source: 'pricing',
    returnTo: '/settings/billing',
  });
  const locked = useRef(false);
  const redirecting = useRef(false);
  const consumed = useRef(false);
  const enabledProviders = useMemo(
    () => ALL_PROVIDERS.filter((p) => configsData?.[`${p}_enabled`] === 'true'),
    [configsData]
  );

  function failure(
    plan: PricingPlan,
    context: Context,
    stage: string,
    provider?: PaymentProvider
  ) {
    track('checkout_failed', {
      plan: plan.productId ?? '',
      source: context.source,
      stage,
      provider: provider ?? 'default',
    });
  }

  const mutation = useMutation({
    mutationFn: async ({
      plan,
      provider,
      context,
    }: {
      plan: PricingPlan;
      provider?: PaymentProvider;
      context: Context;
    }) => {
      const data = await apiPost<{ checkout_url?: string }>(
        '/api/payment/checkout',
        {
          product_id: plan.productId,
          payment_provider: provider,
          redirect: context.returnTo,
        }
      );
      const url = data?.checkout_url
        ? new URL(data.checkout_url, window.location.origin)
        : null;
      if (!url || !['https:', 'http:'].includes(url.protocol))
        throw new Error('Invalid checkout response');
      return url.href;
    },
    onSuccess: (url) => {
      window.location.assign(url);
      redirecting.current = true;
    },
    onError: (_error, { plan, provider, context }) => {
      failure(plan, context, 'checkout', provider);
      toast.error(m['common.pricing.checkout_failed']());
    },
  });

  async function startCheckout(
    plan: PricingPlan,
    context: Context,
    provider?: PaymentProvider
  ) {
    setLoadingProvider(provider ?? null);
    track('begin_checkout', {
      plan: plan.productId ?? '',
      value: (plan.priceInCents ?? 0) / 100,
      source: context.source,
      provider: provider ?? 'default',
    });
    await mutation.mutateAsync({ plan, provider, context });
  }

  async function choosePlan(
    plan: PricingPlan,
    context: Context,
    provider?: PaymentProvider
  ) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    contextRef.current = context;
    try {
      if (provider) {
        await startCheckout(plan, context, provider);
        return;
      }
      const result = configsData ? null : await refetchConfigs();
      const cfg = configsData ?? result?.data;
      if (!cfg || result?.isError) {
        failure(plan, context, 'config');
        toast.error(m['common.pricing.checkout_failed']());
        return;
      }
      const enabled = ALL_PROVIDERS.filter(
        (p) => cfg[`${p}_enabled`] === 'true'
      );
      const configuredDefault = ALL_PROVIDERS.find(
        (p) => p === cfg.default_payment_provider
      );
      if (cfg.select_payment_enabled === 'true' && enabled.length > 1) {
        setPendingPlan(plan);
        setModalMounted(true);
        setModalOpen(true);
        return;
      }
      await startCheckout(plan, context, configuredDefault ?? enabled[0]);
    } catch {
      // Mutation errors are tracked/toasted by onError; keep retries explicit.
    } finally {
      if (!redirecting.current) {
        locked.current = false;
        setBusy(false);
        setLoadingProvider(null);
      }
    }
  }
  const chooseRef = useRef(choosePlan);
  chooseRef.current = choosePlan;

  useEffect(() => {
    if (!resume || sessionPending || !session?.user || consumed.current) return;
    const path = currentPathWithQuery(backTo);
    const intent = parseCheckoutIntent(path);
    if (!intent) return;
    const plan = catalogPlan(intent.productId);
    if (!plan) return;
    consumed.current = true;
    let trusted = false;
    try {
      trusted = canResumeCheckout(
        intent,
        window.sessionStorage.getItem(CHECKOUT_INTENT_KEY)
      );
      if (trusted) window.sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
    } catch {}
    const context = { source: intent.source, returnTo: intent.returnTo };
    contextRef.current = context;
    setResumePlan(plan);
    // Consume before requesting a checkout: refresh/back cannot create another.
    router.replace(cleanCheckoutPath(path));
    track('checkout_resumed', {
      plan: intent.productId,
      source: intent.source,
      automatic: trusted ? 1 : 0,
    });
    if (trusted) void chooseRef.current(plan, context);
  }, [resume, sessionPending, session?.user?.id, backTo]);

  async function checkout(plan: PricingPlan) {
    if (locked.current || !plan.productId || !getPricingProduct(plan.productId))
      return;
    const context: Context = {
      source: checkoutSource(
        source ??
          new URLSearchParams(window.location.search).get('upgrade_from')
      ),
      returnTo: cleanCheckoutPath(
        returnTo ?? currentPathWithQuery('/settings/billing')
      ),
    };
    const currentSession = sessionPending
      ? (await authClient.getSession()).data
      : session;
    track('plan_click', {
      plan: plan.productId,
      value: (plan.priceInCents ?? 0) / 100,
      source: context.source,
      signed_in: currentSession?.user ? 1 : 0,
    });
    if (!currentSession?.user) {
      const intent: CheckoutIntent = {
        productId: plan.productId,
        ...context,
        token: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      try {
        window.sessionStorage.setItem(
          CHECKOUT_INTENT_KEY,
          JSON.stringify(intent)
        );
      } catch {}
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(checkoutCallback(backTo, intent))}`
      );
      return;
    }
    await choosePlan(plan, context);
  }

  const modal = modalMounted && (
    <Suspense fallback={null}>
      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setPendingPlan(null);
        }}
        providers={enabledProviders}
        loadingProvider={loadingProvider}
        onSelect={(provider) => {
          if (pendingPlan)
            void choosePlan(pendingPlan, contextRef.current, provider);
        }}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </Suspense>
  );

  return {
    checkout,
    modal,
    busy: busy || sessionPending,
    resumePlan,
    continueCheckout: () => {
      if (!resumePlan) return;
      track('checkout_resume_confirm', {
        plan: resumePlan.productId ?? '',
        source: contextRef.current.source,
      });
      void choosePlan(resumePlan, contextRef.current);
    },
  };
}
