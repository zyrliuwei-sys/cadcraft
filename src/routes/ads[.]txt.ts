import { createFileRoute } from '@tanstack/react-router';

import { DEFAULT_ADSENSE_CODE } from '@/config';
import { getConfig } from '@/modules/config/service';

export const Route = createFileRoute('/ads.txt')({
  server: {
    handlers: {
      GET: async () => {
        // The publisher ID carries a "ca-" prefix in the AdSense UI, but
        // ads.txt wants the bare "pub-…" form.
        const code =
          (await getConfig('adsense_code'))?.trim() || DEFAULT_ADSENSE_CODE;
        const pubId = code.replace(/^ca-/, '');
        const body = pubId
          ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
          : '';
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
