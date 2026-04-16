'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

interface VisaSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VisaSearchBar({ value, onChange }: VisaSearchBarProps) {
  const t = useTranslations('visa');

  return (
    <div className="relative max-w-md mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-surface border border-border focus:border-primary focus:outline-none text-sm"
      />
    </div>
  );
}
