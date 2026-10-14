import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';

/** Command-line snippet with a copy button. `code` may span lines. */
export function CodeBlock({
  code,
  className,
  prompt = true,
}: {
  code: string;
  className?: string;
  /** Prefix each line with a command-prompt marker. */
  prompt?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: nothing to do
    }
  };

  return (
    <div className={cn('bg-sheet relative border', className)}>
      <pre className="overflow-x-auto py-3.5 pr-14 pl-4 font-mono text-[13px] leading-6">
        {code.split('\n').map((line, i) => (
          <div key={i}>
            {prompt && line && (
              <span className="text-signal-ink mr-2.5 select-none">&gt;</span>
            )}
            {line}
          </div>
        ))}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={m['common.copy']()}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1 right-1 p-2.5 transition-colors"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
