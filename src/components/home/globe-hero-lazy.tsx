'use client';

import dynamic from 'next/dynamic';

export const GlobeHeroLazy = dynamic(
  () => import('./globe-hero').then(mod => ({ default: mod.GlobeHero })),
  { ssr: false },
);