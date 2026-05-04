'use client';

import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  type LucideIcon,
} from 'lucide-react';

const CODE_TO_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  clear: { icon: Sun, color: 'text-yellow-400' },
  partlyCloudy: { icon: Cloud, color: 'text-gray-400' },
  foggy: { icon: CloudFog, color: 'text-gray-500' },
  drizzle: { icon: CloudDrizzle, color: 'text-blue-400' },
  rainy: { icon: CloudRain, color: 'text-blue-500' },
  snowy: { icon: CloudSnow, color: 'text-blue-200' },
  thunderstorm: { icon: CloudLightning, color: 'text-purple-500' },
};

export function getWeatherIcon(code: number): { icon: LucideIcon; color: string } {
  let label: string;
  if (code === 0) label = 'clear';
  else if (code <= 3) label = 'partlyCloudy';
  else if (code <= 48) label = 'foggy';
  else if (code <= 57) label = 'drizzle';
  else if (code <= 67) label = 'rainy';
  else if (code <= 77) label = 'snowy';
  else if (code <= 82) label = 'rainy';
  else if (code <= 86) label = 'snowy';
  else if (code <= 99) label = 'thunderstorm';
  else label = 'clear';

  return CODE_TO_ICON[label] ?? CODE_TO_ICON.clear;
}
