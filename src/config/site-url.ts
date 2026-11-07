import { envConfigs } from '@/config';
import { canonicalSiteOrigin } from '@/lib/canonical-url';

export const SITE_URL = canonicalSiteOrigin(envConfigs.app_url);
