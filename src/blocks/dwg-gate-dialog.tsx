import { useState } from 'react';
import { Download, Mail } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
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

// Fake door: the web build can't read DWG, so measure how many visitors want
// it before building server-side conversion. Signed-out visitors are sent to
// sign in; their later sign-up joins this visitor in the funnel.
export function DwgGateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [joined, setJoined] = useState(false);

  const join = () => {
    track('dwg_waitlist_join', { signed_in: session?.user ? 1 : 0 });
    if (session?.user) setJoined(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m['cad.online.dwg_title']()}</DialogTitle>
          <DialogDescription>{m['cad.online.dwg_desc']()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2">{m['cad.online.dwg_desktop']()}</p>
            <Link
              href="/download"
              onClick={() => track('dwg_gate_download')}
              className={cn(ctaSecondary, 'h-10 w-full px-4 text-sm')}
            >
              <Download className="size-4" />
              {m['cad.online.dwg_desktop_cta']()}
            </Link>
          </div>

          <div>
            <p className="mb-2">{m['cad.online.dwg_waitlist']()}</p>
            {joined ? (
              <p className="text-muted-foreground border p-3">
                {m['cad.online.dwg_joined']({
                  email: session?.user.email ?? '',
                })}
              </p>
            ) : session?.user ? (
              <button
                type="button"
                onClick={join}
                className={cn(ctaPrimary, 'h-10 w-full px-4 text-sm')}
              >
                <Mail className="size-4" />
                {m['cad.online.dwg_notify']()}
              </button>
            ) : (
              <Link
                href="/sign-in?callbackUrl=/online"
                onClick={join}
                className={cn(ctaPrimary, 'h-10 w-full px-4 text-sm')}
              >
                <Mail className="size-4" />
                {m['cad.online.dwg_notify_signin']()}
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
