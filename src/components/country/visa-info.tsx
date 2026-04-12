'use client';

import { useTranslations } from 'next-intl';
import type { VisaInfo } from '@/types/country';
import { CheckCircle, AlertCircle, Globe, Clock, FileText } from 'lucide-react';

interface VisaInfoProps {
  visa: VisaInfo;
}

export function VisaInfo({ visa }: VisaInfoProps) {
  const t = useTranslations('visa');

  const typeLabels: Record<string, string> = {
    required: t('required'),
    not_required: t('notRequired'),
    on_arrival: t('onArrival'),
    e_visa: t('eVisa'),
  };

  const typeColors: Record<string, string> = {
    required: 'text-red-400 bg-red-500/10',
    not_required: 'text-green-400 bg-green-500/10',
    on_arrival: 'text-yellow-400 bg-yellow-500/10',
    e_visa: 'text-blue-400 bg-blue-500/10',
  };

  return (
    <div className="bg-bg-surface rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${typeColors[visa.requirement_type]}`}>
        {visa.requirement_type === 'not_required' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {typeLabels[visa.requirement_type]}
      </div>

      {visa.processing_time && (
        <div className="flex items-center gap-2 mt-4 text-txt-sec text-sm">
          <Clock className="w-4 h-4" />
          {t('processingTime')}: {visa.processing_time}
        </div>
      )}

      {visa.documents.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t('documents')}
          </h4>
          <ul className="space-y-1 text-sm text-txt-sec">
            {visa.documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-green-400 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visa.embassy_link && (
        <a
          href={visa.embassy_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-primary hover:underline text-sm"
        >
          <Globe className="w-4 h-4" />
          {t('embassy')}
        </a>
      )}
    </div>
  );
}
