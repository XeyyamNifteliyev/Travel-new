'use client';

import { useTranslations } from 'next-intl';
import { VisaInfo } from '@/components/country/visa-info';
import type { VisaInfo as VisaInfoType } from '@/types/country';

const visaData: VisaInfoType[] = [
  { id: '1', country_id: '1', requirement_type: 'not_required', processing_time: '-', documents: [], notes_az: 'Azərbaycan vətəndaşları üçün vizasız (90 gün)' },
  { id: '2', country_id: '2', requirement_type: 'on_arrival', processing_time: 'Anında', documents: ['Pasport (6 ay)', 'Qayıdış bileti'], notes_az: 'Gəlişdə viza — 30 gün' },
  { id: '3', country_id: '3', requirement_type: 'not_required', processing_time: '-', documents: [], notes_az: 'Azərbaycan vətəndaşları üçün vizasız (1 il)' },
  { id: '4', country_id: '4', requirement_type: 'required', processing_time: '5-7 iş günü', documents: ['Pasport', 'Viza ərizəsi', 'Foto', 'Səyahət planı', 'Maliyyə sübutu'], notes_az: 'Əvvəlcədən müraciət lazımdır' },
  { id: '5', country_id: '5', requirement_type: 'not_required', processing_time: '-', documents: [], notes_az: '30 gün vizasız' },
];

const countryNames: Record<string, string> = {
  '1': 'Türkiyə 🇹🇷',
  '2': 'Dubai 🇦🇪',
  '3': 'Gürcüstan 🇬🇪',
  '4': 'Yaponiya 🇯🇵',
  '5': 'Tailand 🇹🇭',
};

export default function VisaPage() {
  const t = useTranslations('visa');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <div className="space-y-6">
        {visaData.map((visa) => (
          <div key={visa.id}>
            <h2 className="text-lg font-semibold mb-2">{countryNames[visa.country_id]}</h2>
            <VisaInfo visa={visa} />
          </div>
        ))}
      </div>
    </div>
  );
}
