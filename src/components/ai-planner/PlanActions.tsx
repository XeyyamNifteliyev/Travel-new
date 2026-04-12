'use client';

import { useTranslations } from 'next-intl';
import { RotateCcw, Share2, Copy } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onReset: () => void;
}

export function PlanActions({ onReset }: Props) {
  const t = useTranslations('aiPlanner');
  const [copied, setCopied] = useState(false);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'TravelAZ AI Plan',
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface hover:bg-bg-surface-hover text-txt rounded-xl text-sm transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {t('share')}
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface hover:bg-bg-surface-hover text-txt rounded-xl text-sm transition-colors"
      >
        <Copy className="w-4 h-4" />
        {copied ? t('copied') : t('copyLink')}
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        {t('newPlan')}
      </button>
    </div>
  );
}
