import { Check, Cloud } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { ctaPrimary } from '@/lib/cta';
import { track } from '@/lib/track';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/** Shown when a free user reaches for a cloud feature. */
export function ProUpsellDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const features = [
    m['cad.pricing.f_cloud'](),
    m['cad.pricing.f_history'](),
    m['cad.pricing.f_share'](),
    m['cad.pricing.f_unlimited'](),
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="size-5" />
            {m['cad.cloud.upsell_title']()}
          </DialogTitle>
          <DialogDescription>{m['cad.cloud.upsell_desc']()}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/pricing"
          onClick={() => track('pro_upsell_click', { from: 'cloud_dialog' })}
          className={cn(ctaPrimary, 'mt-2 h-10 w-full px-4 text-sm')}
        >
          {m['cad.cloud.upsell_cta']()}
        </Link>
      </DialogContent>
    </Dialog>
  );
}
