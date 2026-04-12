'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, MapPin, DollarSign, Calendar, Star } from 'lucide-react';
import type { Country } from '@/types/country';

const countries: Country[] = [
  { id: '1', slug: 'turkey', name_az: 'Türkiyə', name_ru: 'Турция', name_en: 'Turkey', flag_emoji: '🇹🇷', description: 'İstanbul, Antalya, Kapadokya və daha çoxu', description_az: 'İstanbul, Antalya, Kapadokya və daha çoxu', description_ru: 'Стамбул, Анталья, Каппадокия и многое другое', description_en: 'Istanbul, Antalya, Cappadocia and more', best_time: 'Apr-May, Sep-Nov', avg_costs: { flight: '150 AZN', hotel: '60 AZN', daily: '80 AZN' }, popular_places: ['İstanbul', 'Antalya', 'Kapadokya'] },
  { id: '2', slug: 'dubai', name_az: 'Dubai', name_ru: 'Дубай', name_en: 'Dubai', flag_emoji: '🇦🇪', description: 'Müasir memarlıq, lüks alış-veriş', description_az: 'Müasir memarlıq, lüks alış-veriş', description_ru: 'Современная архитектура, роскошный шоппинг', description_en: 'Modern architecture, luxury shopping', best_time: 'Nov-Mar', avg_costs: { flight: '400 AZN', hotel: '150 AZN', daily: '200 AZN' }, popular_places: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'] },
  { id: '3', slug: 'georgia', name_az: 'Gürcüstan', name_ru: 'Грузия', name_en: 'Georgia', flag_emoji: '🇬🇪', description: 'Tiflis, Batumi, dağ kəndləri', description_az: 'Tiflis, Batumi, dağ kəndləri', description_ru: 'Тбилиси, Батуми, горные деревни', description_en: 'Tbilisi, Batumi, mountain villages', best_time: 'May-Oct', avg_costs: { flight: '100 AZN', hotel: '50 AZN', daily: '60 AZN' }, popular_places: ['Tiflis', 'Batumi', 'Kazbegi'] },
  { id: '4', slug: 'japan', name_az: 'Yaponiya', name_ru: 'Япония', name_en: 'Japan', flag_emoji: '🇯🇵', description: 'Tokyo, Kyoto, Fuji dağı', description_az: 'Tokyo, Kyoto, Fuji dağı', description_ru: 'Токио, Киото, гора Фудзи', description_en: 'Tokyo, Kyoto, Mount Fuji', best_time: 'Mar-May, Oct-Nov', avg_costs: { flight: '1200 AZN', hotel: '120 AZN', daily: '150 AZN' }, popular_places: ['Tokyo', 'Kyoto', 'Osaka'] },
  { id: '5', slug: 'thailand', name_az: 'Tailand', name_ru: 'Таиланд', name_en: 'Thailand', flag_emoji: '🇹🇭', description: 'Banqkok, Phuket, tropik çimərliklər', description_az: 'Banqkok, Phuket, tropik çimərliklər', description_ru: 'Бангкок, Пхукет, тропические пляжи', description_en: 'Bangkok, Phuket, tropical beaches', best_time: 'Nov-Feb', avg_costs: { flight: '900 AZN', hotel: '40 AZN', daily: '50 AZN' }, popular_places: ['Banqkok', 'Phuket', 'Chiang Mai'] },
  { id: '6', slug: 'italy', name_az: 'İtaliya', name_ru: 'Италия', name_en: 'Italy', flag_emoji: '🇮🇹', description: 'Roma, Venesiya, Florensiya', description_az: 'Roma, Venesiya, Florensiya', description_ru: 'Рим, Венеция, Флоренция', description_en: 'Rome, Venice, Florence', best_time: 'Apr-Jun, Sep-Oct', avg_costs: { flight: '500 AZN', hotel: '100 AZN', daily: '120 AZN' }, popular_places: ['Roma', 'Venesiya', 'Milan'] },
  { id: '7', slug: 'france', name_az: 'Fransa', name_ru: 'Франция', name_en: 'France', flag_emoji: '🇫🇷', description: 'Paris, Luvr, Eyfel qülləsi', description_az: 'Paris, Luvr, Eyfel qülləsi', description_ru: 'Париж, Лувр, Эйфелева башня', description_en: 'Paris, Louvre, Eiffel Tower', best_time: 'Apr-Jun, Sep-Oct', avg_costs: { flight: '550 AZN', hotel: '130 AZN', daily: '140 AZN' }, popular_places: ['Paris', 'Nice', 'Lyon'] },
  { id: '8', slug: 'russia', name_az: 'Rusiya', name_ru: 'Россия', name_en: 'Russia', flag_emoji: '🇷🇺', description: 'Moskva, Sankt-Peterburq', description_az: 'Moskva, Sankt-Peterburq', description_ru: 'Москва, Санкт-Петербург', description_en: 'Moscow, Saint Petersburg', best_time: 'Jun-Aug', avg_costs: { flight: '300 AZN', hotel: '70 AZN', daily: '80 AZN' }, popular_places: ['Moskva', 'Sankt-Peterburq'] },
  { id: '9', slug: 'iran', name_az: 'İran', name_ru: 'Иран', name_en: 'Iran', flag_emoji: '🇮🇷', description: 'Tehran, İsfahan, Şiraz', description_az: 'Tehran, İsfahan, Şiraz', description_ru: 'Тегеран, Исфахан, Шираз', description_en: 'Tehran, Isfahan, Shiraz', best_time: 'Mar-May, Sep-Nov', avg_costs: { flight: '200 AZN', hotel: '30 AZN', daily: '40 AZN' }, popular_places: ['Tehran', 'İsfahan', 'Şiraz'] },
  { id: '10', slug: 'uk', name_az: 'İngiltərə', name_ru: 'Англия', name_en: 'England', flag_emoji: '🇬🇧', description: 'London, Big Ben, Tower Bridge', description_az: 'London, Big Ben, Tower Bridge', description_ru: 'Лондон, Биг-Бен, Тауэрский мост', description_en: 'London, Big Ben, Tower Bridge', best_time: 'Jun-Aug', avg_costs: { flight: '600 AZN', hotel: '150 AZN', daily: '160 AZN' }, popular_places: ['London', 'Manchester', 'Oxford'] },
];

export default function CountryDetailPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const slug = params?.slug as string;
  const t = useTranslations('countries');
  const tc = useTranslations('common');

  const country = countries.find((c) => c.slug === slug);
  if (!country) return <div className="max-w-4xl mx-auto px-4 py-12">{t('notFound')}</div>;

  const name = country[`name_${locale}` as keyof Country] as string;
  const description = (country[`description_${locale}` as keyof Country] as string) || country.description;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${locale}/countries`} className="flex items-center gap-2 text-txt-sec hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t('backToCountries')}
      </Link>

      <div className="bg-bg-surface rounded-xl p-8 border border-border mb-8">
        <div className="text-6xl mb-4">{country.flag_emoji}</div>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-txt-sec text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-surface rounded-xl p-6 border border-border">
          <Calendar className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold mb-2">{t('bestTime')}</h3>
          <p className="text-txt-sec text-sm">{country.best_time}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-6 border border-border">
          <DollarSign className="w-6 h-6 text-secondary mb-3" />
          <h3 className="font-semibold mb-2">{t('avgCosts')}</h3>
          <ul className="text-txt-sec text-sm space-y-1">
            <li>{t('flight')}: {country.avg_costs.flight}</li>
            <li>{t('hotel')}: {country.avg_costs.hotel}{tc('perNight')}</li>
            <li>{t('daily')}: {country.avg_costs.daily}</li>
          </ul>
        </div>
        <div className="bg-bg-surface rounded-xl p-6 border border-border">
          <MapPin className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-semibold mb-2">{t('popularPlaces')}</h3>
          <ul className="text-txt-sec text-sm space-y-1">
            {country.popular_places.map((place) => (
              <li key={place} className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {place}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-bg-surface rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">{tc('searchFlightsTo')} {name}</h2>
        <Link href={`/${locale}/flights`} className="text-primary hover:underline">
          {tc('goToFlightSearch')} →
        </Link>
      </div>
    </div>
  );
}
