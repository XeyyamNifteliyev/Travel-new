'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plane, ChevronDown, Loader2, ShieldCheck, AlertTriangle, FileText, Clock } from 'lucide-react';
import type { VisaRequirement, VisaStatus } from '@/lib/visa/visalist-api';

interface VisaCheckWidgetProps {
  defaultPassport?: string;
  defaultDestination?: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<VisaStatus, { bg: string; text: string; icon: typeof ShieldCheck }> = {
  visaFree: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', icon: ShieldCheck },
  visaOnArrival: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: Clock },
  eVisa: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: FileText },
  visaRequired: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: AlertTriangle },
  unknown: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', icon: AlertTriangle },
};

const COUNTRY_OPTIONS = [
  { code: 'AZ', label: 'Azərbaycan 🇦🇿' },
  { code: 'TR', label: 'Türkiyə 🇹🇷' },
  { code: 'RU', label: 'Россия 🇷🇺' },
  { code: 'US', label: 'USA 🇺🇸' },
  { code: 'GB', label: 'UK 🇬🇧' },
  { code: 'DE', label: 'Deutschland 🇩🇪' },
  { code: 'FR', label: 'France 🇫🇷' },
  { code: 'GE', label: 'საქართველო 🇬🇪' },
  { code: 'IR', label: 'ایران 🇮🇷' },
  { code: 'AE', label: 'UAE 🇦🇪' },
  { code: 'CN', label: '中国 🇨🇳' },
  { code: 'IN', label: 'India 🇮🇳' },
  { code: 'BR', label: 'Brasil 🇧🇷' },
  { code: 'JP', label: '日本 🇯🇵' },
  { code: 'KR', label: '한국 🇰🇷' },
  { code: 'IT', label: 'Italia 🇮🇹' },
  { code: 'ES', label: 'España 🇪🇸' },
  { code: 'SA', label: 'السعودية 🇸🇦' },
  { code: 'UZ', label: "O'zbekiston 🇺🇿" },
  { code: 'KZ', label: 'Қазақстан 🇰🇿' },
];

export function VisaCheckWidget({ defaultPassport = 'AZ', defaultDestination, compact }: VisaCheckWidgetProps) {
  const t = useTranslations('visaCheck');
  const [passport, setPassport] = useState(defaultPassport);
  const [destination, setDestination] = useState(defaultDestination ?? '');
  const [result, setResult] = useState<VisaRequirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleCheck = async () => {
    if (!passport || !destination) return;
    setLoading(true);
    setError(false);
    setResult(null);

    try {
      const res = await fetch(`/api/visa/check?passport=${passport}&destination=${destination}`);
      if (!res.ok) throw new Error('Failed');
      const data: VisaRequirement = await res.json();
      setResult(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-bg-surface/50 rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-3">
          <select
            value={passport}
            onChange={(e) => setPassport(e.target.value)}
            className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-txt focus:ring-2 focus:ring-primary"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <Plane className="w-4 h-4 text-primary flex-shrink-0" />
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-txt focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('selectDestination')}</option>
            {COUNTRY_OPTIONS.filter((c) => c.code !== passport).map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={handleCheck}
            disabled={!destination || loading}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('check')}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mt-2">{t('error')}</p>}
        {result && (
          <div className={`mt-3 px-3 py-2 rounded-lg border ${STATUS_CONFIG[result.status].bg}`}>
            <p className={`text-sm font-medium ${STATUS_CONFIG[result.status].text}`}>
              {t(result.status)}
            </p>
            {result.duration && <p className="text-xs text-txt-sec mt-0.5">{result.duration}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        {t('title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-txt-sec mb-2">{t('selectPassport')}</label>
          <div className="relative">
            <select
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm text-txt appearance-none focus:ring-2 focus:ring-primary"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-txt-sec mb-2">{t('selectDestination')}</label>
          <div className="relative">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm text-txt appearance-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('selectDestination')}</option>
              {COUNTRY_OPTIONS.filter((c) => c.code !== passport).map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sec pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleCheck}
            disabled={!destination || loading}
            className="w-full py-3 bg-gradient-to-br from-primary to-sky-400 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('check')}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{t('error')}</p>}

      {result && (
        <div className={`rounded-xl border p-5 ${STATUS_CONFIG[result.status].bg}`}>
          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const Icon = STATUS_CONFIG[result.status].icon;
              return <Icon className={`w-6 h-6 ${STATUS_CONFIG[result.status].text}`} />;
            })()}
            <p className={`text-lg font-bold ${STATUS_CONFIG[result.status].text}`}>
              {t(result.status)}
            </p>
          </div>
          {result.duration && (
            <p className="text-sm text-txt-sec"><strong>{t('duration')}:</strong> {result.duration}</p>
          )}
          {result.notes && (
            <p className="text-sm text-txt-sec mt-1"><strong>{t('notes')}:</strong> {result.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
