import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['az', 'ru', 'en'],
  defaultLocale: 'az',
  localePrefix: 'always'
});

export const { Link, useRouter, usePathname } = createSharedPathnamesNavigation({
  locales: routing.locales
});

export type Locale = (typeof routing.locales)[number];
