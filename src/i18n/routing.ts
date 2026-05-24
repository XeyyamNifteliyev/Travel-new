import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['az', 'ru', 'en'],
  defaultLocale: 'az',
  localePrefix: 'always'
});

export const { Link, useRouter, usePathname } = createNavigation(routing);

export type Locale = (typeof routing.locales)[number];
