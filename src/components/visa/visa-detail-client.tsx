'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import VisaDocumentChecklist from './visa-document-checklist';
import VisaAIChat from './visa-ai-chat';
import type { VisaDocument } from '@/types/country';

interface VisaDetailClientProps {
  country: {
    id: string;
    name_az: string;
    name_en: string;
    name_ru: string;
    slug: string;
    flag_emoji: string;
  };
  visa: Record<string, unknown>;
  documents: VisaDocument[];
  locale: string;
}

const TYPE_LABELS: Record<string, string> = {
  not_required: 'notRequired',
  on_arrival: 'onArrival',
  e_visa: 'eVisa',
  required: 'required',
};

const TYPE_COLORS: Record<string, string> = {
  not_required: 'text-green-400 bg-green-500/10 border-green-500/20',
  on_arrival: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  e_visa: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  required: 'text-red-400 bg-red-500/10 border-red-500/20',
};

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations<'visa'>>): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return t('today');
  if (days === 1) return t('yesterday');
  if (days < 30) return t('daysAgo', { count: days });
  return t('monthsAgo', { count: Math.floor(days / 30) });
}

function formatProcessingTime(
  requirementType: string,
  min: number | null,
  max: number | null,
  t: ReturnType<typeof useTranslations<'visa'>>
) {
  if (max && min !== null) return `${min}-${max} ${t('workDays')}`;
  if (max) return `${max} ${t('workDays')}`;
  if (requirementType === 'not_required') return t('notRequiredProcessing');
  return t('notAvailable');
}

function formatVisaFee(requirementType: string, feeUsd: number | null, t: ReturnType<typeof useTranslations<'visa'>>) {
  if (typeof feeUsd === 'number' && feeUsd > 0) return `$${feeUsd}`;
  if (requirementType === 'not_required' || feeUsd === 0) return t('feeFree');
  return t('notAvailable');
}

function isSameUrl(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.replace(/\/$/, '') === right.replace(/\/$/, '');
}

export default function VisaDetailClient({ country, visa, documents, locale }: VisaDetailClientProps) {
  const t = useTranslations('visa');
  const name = country[`name_${locale}` as 'name_az' | 'name_en' | 'name_ru'] || country.name_az;

  const requirementType = visa.requirement_type as string;
  const feeUsd = visa.fee_usd as number | null;
  const processingMin = visa.processing_days_min as number | null;
  const processingMax = visa.processing_days_max as number | null;
  const maxStayDays = visa.max_stay_days as number | null;
  const validityDays = visa.validity_days as number | null;
  const isEvisa = visa.is_evisa as boolean;
  const evisaUrl = visa.evisa_url as string | null;
  const officialVisaUrl = visa.official_visa_url as string | null;
  const officialUrl = visa.official_url as string | null;
  const appointmentUrl = visa.appointment_url as string | null;
  const lastVerified = visa.last_verified_at as string | null;
  const notes = (visa[`notes_${locale}`] as string) || (visa.notes_az as string) || (visa.notes_en as string) || '';
  const primaryOfficialUrl = officialVisaUrl || officialUrl;
  const showOfficialSourceUrl = Boolean(officialVisaUrl && officialUrl && !isSameUrl(officialVisaUrl, officialUrl));
  const showEvisaButton = Boolean(isEvisa && evisaUrl && !isSameUrl(evisaUrl, primaryOfficialUrl));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${locale}/visa`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        {t('backToVisa')}
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <span className="text-5xl">{country.flag_emoji}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-txt-sec text-sm mt-1">{t('detailSubtitle')}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${TYPE_COLORS[requirementType] || ''}`}>
          {t(TYPE_LABELS[requirementType] || 'required')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-txt-sec">{t('processingTime')}</p>
            <p className="font-semibold">{formatProcessingTime(requirementType, processingMin, processingMax, t)}</p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-txt-sec">{t('fee')}</p>
            <p className="font-semibold">{formatVisaFee(requirementType, feeUsd, t)}</p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-xl p-4 border border-border flex items-start gap-3">
          <Calendar className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-txt-sec">{maxStayDays ? t('maxStay') : t('validity')}</p>
            <p className="font-semibold">
              {maxStayDays ? `${maxStayDays} ${t('days')}` : validityDays ? `${validityDays} ${t('days')}` : t('notAvailable')}
            </p>
          </div>
        </div>
      </div>

      {isEvisa && evisaUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
          <div className="flex-1">
            <p className="text-green-400 font-medium text-sm">{t('evisaAvailable')}</p>
          </div>
          {showEvisaButton && (
            <a href={evisaUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-1 hover:bg-green-500/30 transition-colors">
              {t('evisaPortal')} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {notes && (
        <div className="bg-bg-surface rounded-xl p-4 border border-border mb-6">
          <p className="text-sm">{notes}</p>
        </div>
      )}

      {documents.length > 0 && (
        <VisaDocumentChecklist documents={documents} countrySlug={country.slug} />
      )}

      {(primaryOfficialUrl || showOfficialSourceUrl || appointmentUrl) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {primaryOfficialUrl && (
            <a href={primaryOfficialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
              <ExternalLink className="w-4 h-4" />
              {officialVisaUrl ? t('officialVisaPage') : t('officialSource')}
            </a>
          )}
          {showOfficialSourceUrl && officialUrl && (
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
              <ExternalLink className="w-4 h-4" />
              {t('officialSource')}
            </a>
          )}
          {appointmentUrl && (
            <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
              <Calendar className="w-4 h-4" />
              {t('appointment')}
            </a>
          )}
        </div>
      )}

      <VisaAIChat countrySlug={country.slug} countryName={name} requirementType={requirementType} />

      <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div className="text-sm text-txt-sec">
          <p>{t('disclaimer')}</p>
          {lastVerified && (
            <p className="mt-1 flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              {t('lastVerified')}: {timeAgo(lastVerified, t)}
            </p>
          )}
          <a
            href="https://en.wikipedia.org/wiki/Visa_requirements_for_Azerbaijani_citizens"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t('sourceWikipedia')}
          </a>
        </div>
      </div>
    </div>
  );
}
