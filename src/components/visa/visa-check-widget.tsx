'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Loader2,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import type { VisaRequirement, VisaStatus } from '@/lib/visa/visalist-api';
import type { VisaCountryData, VisaInfo } from '@/types/country';
import VisaAIChat from './visa-ai-chat';
import VisaDocumentChecklist from './visa-document-checklist';

interface VisaCheckWidgetProps {
  defaultPassport?: string;
  defaultDestination?: string;
  compact?: boolean;
  countries?: VisaCountryData[];
}

const STATUS_CONFIG: Record<VisaStatus, { bg: string; text: string; icon: typeof ShieldCheck }> = {
  visaFree: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', icon: ShieldCheck },
  visaOnArrival: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: Clock },
  eVisa: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: FileText },
  visaRequired: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: AlertTriangle },
  unknown: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', icon: AlertTriangle },
};

const TYPE_TO_STATUS: Record<string, VisaStatus> = {
  not_required: 'visaFree',
  on_arrival: 'visaOnArrival',
  e_visa: 'eVisa',
  required: 'visaRequired',
};

const TYPE_LABELS: Record<string, string> = {
  not_required: 'notRequired',
  on_arrival: 'onArrival',
  e_visa: 'eVisa',
  required: 'required',
};

const FALLBACK_COUNTRY_OPTIONS = [
  { code: 'TR', label: 'Türkiyə' },
  { code: 'RU', label: 'Rusiya' },
  { code: 'US', label: 'ABŞ' },
  { code: 'GB', label: 'Böyük Britaniya' },
  { code: 'DE', label: 'Almaniya' },
  { code: 'FR', label: 'Fransa' },
  { code: 'GE', label: 'Gürcüstan' },
  { code: 'IR', label: 'İran' },
  { code: 'AE', label: 'BƏƏ' },
  { code: 'JP', label: 'Yaponiya' },
  { code: 'IT', label: 'İtaliya' },
  { code: 'QA', label: 'Qətər' },
];

const SELECT_OPTION_CLASS = 'bg-white text-black';

function getLocalizedNotes(visa: VisaInfo, locale: string) {
  if (locale === 'en') return visa.notes_en || visa.notes_az || visa.notes_ru || '';
  if (locale === 'ru') return visa.notes_ru || visa.notes_az || visa.notes_en || '';
  return visa.notes_az || visa.notes_en || visa.notes_ru || '';
}

function formatProcessingTime(
  requirementType: string,
  min: number | undefined,
  max: number | undefined,
  t: ReturnType<typeof useTranslations<'visa'>>
) {
  if (max && min !== undefined && min !== null) return `${min}-${max} ${t('workDays')}`;
  if (max) return `${max} ${t('workDays')}`;
  if (requirementType === 'not_required') return t('notRequiredProcessing');
  return t('notAvailable');
}

function formatVisaFee(requirementType: string, feeUsd: number | undefined, t: ReturnType<typeof useTranslations<'visa'>>) {
  if (typeof feeUsd === 'number' && feeUsd > 0) return `$${feeUsd}`;
  if (requirementType === 'not_required' || feeUsd === 0) return t('feeFree');
  return t('notAvailable');
}

function isSameUrl(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.replace(/\/$/, '') === right.replace(/\/$/, '');
}

export function VisaCheckWidget({ defaultPassport = 'AZ', defaultDestination, compact, countries = [] }: VisaCheckWidgetProps) {
  const tCheck = useTranslations('visaCheck');
  const tVisa = useTranslations('visa');
  const locale = useLocale();
  const passport = defaultPassport || 'AZ';
  const [destination, setDestination] = useState(defaultDestination ?? '');
  const [compactResult, setCompactResult] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.country.name_az.localeCompare(b.country.name_az, 'az')),
    [countries]
  );

  const selectedVisaData = useMemo(() => {
    if (!destination || compact) return null;
    return sortedCountries.find(({ country }) => country.slug === destination || country.cca2 === destination) || null;
  }, [compact, destination, sortedCountries]);

  useEffect(() => {
    if (!defaultDestination || compact || !sortedCountries.length) return;
    const match = sortedCountries.find(({ country }) => country.cca2 === defaultDestination || country.slug === defaultDestination);
    if (match) setDestination(match.country.slug);
  }, [compact, defaultDestination, sortedCountries]);

  const handleCompactCheck = async () => {
    if (!passport || !destination) return;
    setLoading(true);
    setError(false);
    setCompactResult(null);

    try {
      const res = await fetch(`/api/visa/check?passport=${passport}&destination=${destination}&locale=${locale}`);
      if (!res.ok) throw new Error('Failed');
      const data: VisaRequirement = await res.json();
      setCompactResult(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-bg-surface/50 rounded-xl border border-border/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={passport}
            disabled
            className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-txt opacity-80 focus:ring-2 focus:ring-primary"
          >
            <option value="AZ" className={SELECT_OPTION_CLASS}>Azərbaycan 🇦🇿</option>
          </select>
          <Plane className="hidden w-4 h-4 text-primary flex-shrink-0 sm:block" />
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-txt focus:ring-2 focus:ring-primary"
          >
            <option value="" className={SELECT_OPTION_CLASS}>{tCheck('selectDestination')}</option>
            {FALLBACK_COUNTRY_OPTIONS.filter((c) => c.code !== passport).map((c) => (
              <option key={c.code} value={c.code} className={SELECT_OPTION_CLASS}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={handleCompactCheck}
            disabled={!destination || loading}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tCheck('check')}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mt-2">{tCheck('error')}</p>}
        {compactResult && (
          <div className={`mt-3 px-3 py-2 rounded-lg border ${STATUS_CONFIG[compactResult.status].bg}`}>
            <p className={`text-sm font-medium ${STATUS_CONFIG[compactResult.status].text}`}>
              {tCheck(compactResult.status)}
            </p>
            {compactResult.duration && <p className="text-xs text-txt-sec mt-0.5">{compactResult.duration}</p>}
          </div>
        )}
      </div>
    );
  }

  const visa = selectedVisaData?.visa;
  const country = selectedVisaData?.country;
  const status = visa ? TYPE_TO_STATUS[visa.requirement_type] || 'unknown' : 'unknown';
  const StatusIcon = STATUS_CONFIG[status].icon;
  const notes = visa ? getLocalizedNotes(visa, locale) : '';
  const primaryOfficialUrl = visa ? visa.official_visa_url || visa.official_url : undefined;
  const showOfficialSourceUrl = Boolean(visa?.official_visa_url && visa?.official_url && !isSameUrl(visa.official_visa_url, visa.official_url));
  const showEvisaButton = Boolean(visa?.is_evisa && visa.evisa_url && !isSameUrl(visa.evisa_url, primaryOfficialUrl));

  return (
    <div className="bg-bg-surface rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        {tCheck('title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-txt-sec mb-2">{tCheck('selectPassport')}</label>
          <div className="relative">
            <select
              value={passport}
              disabled
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm text-txt opacity-80 appearance-none focus:ring-2 focus:ring-primary"
            >
              <option value="AZ" className={SELECT_OPTION_CLASS}>Azərbaycan 🇦🇿</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-txt-sec mb-2">{tCheck('selectDestination')}</label>
          <div className="relative">
            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setError(false);
              }}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm text-txt appearance-none focus:ring-2 focus:ring-primary"
            >
              <option value="" className={SELECT_OPTION_CLASS}>{tCheck('selectDestination')}</option>
              {sortedCountries.length > 0
                ? sortedCountries.map(({ country }) => (
                    <option key={country.id} value={country.slug} className={SELECT_OPTION_CLASS}>
                      {country.name_az} {country.flag_emoji}
                    </option>
                  ))
                : FALLBACK_COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code} className={SELECT_OPTION_CLASS}>{c.label}</option>
                  ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec pointer-events-none" />
          </div>
        </div>
      </div>

      {!selectedVisaData && (
        <div className="rounded-xl border border-dashed border-border p-6 text-sm text-txt-sec">
          {destination ? tVisa('noVisaInfo') : tVisa('selectCountryForDetails')}
        </div>
      )}

      {visa && country && (
        <div className={`rounded-2xl border p-5 ${STATUS_CONFIG[status].bg}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-6 h-6 ${STATUS_CONFIG[status].text}`} />
                <div>
                  <p className="text-sm text-txt-sec">{tVisa('visaStatusFor', { country: country.name_az })}</p>
                  <p className={`text-xl font-bold ${STATUS_CONFIG[status].text}`}>
                    {tVisa(TYPE_LABELS[visa.requirement_type] || 'required')}
                  </p>
                </div>
              </div>
              {notes && <p className="text-sm text-txt-sec mt-3 leading-6">{notes}</p>}
            </div>
            <a
              href={`/${locale}/visa/${country.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface/80 px-4 py-2 text-sm font-semibold hover:border-primary/40"
            >
              {tVisa('openFullPage')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl border border-border bg-bg-surface/80 p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-txt-sec">{tVisa('processingTime')}</p>
                <p className="font-semibold">{formatProcessingTime(visa.requirement_type, visa.processing_days_min, visa.processing_days_max, tVisa)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-surface/80 p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-txt-sec">{tVisa('fee')}</p>
                <p className="font-semibold">{formatVisaFee(visa.requirement_type, visa.fee_usd, tVisa)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-surface/80 p-4 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-txt-sec">{visa.max_stay_days ? tVisa('maxStay') : tVisa('validity')}</p>
                <p className="font-semibold">
                  {visa.max_stay_days
                    ? `${visa.max_stay_days} ${tVisa('days')}`
                    : visa.validity_days
                      ? `${visa.validity_days} ${tVisa('days')}`
                      : tVisa('notAvailable')}
                </p>
              </div>
            </div>
          </div>

          {visa.is_evisa && visa.evisa_url && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-5 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-green-400 font-medium text-sm flex-1">{tVisa('evisaAvailable')}</p>
              {showEvisaButton && (
                <a href={visa.evisa_url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-1 hover:bg-green-500/30 transition-colors">
                  {tVisa('evisaPortal')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {(primaryOfficialUrl || showOfficialSourceUrl || visa.appointment_url) && (
            <div className="flex flex-wrap gap-3 mt-5">
              {primaryOfficialUrl && (
                <a href={primaryOfficialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {visa.official_visa_url ? tVisa('officialVisaPage') : tVisa('officialSource')}
                </a>
              )}
              {showOfficialSourceUrl && (
                <a href={visa.official_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {tVisa('officialSource')}
                </a>
              )}
              {visa.appointment_url && (
                <a href={visa.appointment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-4 py-2.5 bg-bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Calendar className="w-4 h-4" />
                  {tVisa('appointment')}
                </a>
              )}
            </div>
          )}

          {selectedVisaData.documents.length > 0 && (
            <div className="mt-5">
              <VisaDocumentChecklist documents={selectedVisaData.documents} countrySlug={country.slug} />
            </div>
          )}

          <VisaAIChat countrySlug={country.slug} countryName={country.name_az} requirementType={visa.requirement_type} />

          <div className="mt-5 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-txt-sec">{tVisa('disclaimer')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
