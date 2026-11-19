import { createFileRoute } from '@tanstack/react-router';

import { staticPageRouteOptions } from './-static-page';

export const Route = createFileRoute('/(pages)/cadcraft-cli')(
  staticPageRouteOptions('cadcraft-cli')
);
