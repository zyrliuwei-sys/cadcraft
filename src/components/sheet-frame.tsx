import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** A drawing sheet: hairline graphite border, paper margin, orange snap corners. */
export function SheetFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <span
        className="border-signal bg-background absolute -top-1.5 -left-1.5 z-10 size-3 border-2"
        aria-hidden="true"
      />
      <span
        className="border-signal bg-background absolute -right-1.5 -bottom-1.5 z-10 size-3 border-2"
        aria-hidden="true"
      />
      <div className="border-foreground/80 bg-sheet border p-1.5 shadow-[0_40px_80px_-40px_oklch(0.22_0.012_255/0.45)] sm:p-2.5">
        {children}
      </div>
    </div>
  );
}
