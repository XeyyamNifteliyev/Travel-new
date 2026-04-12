import { CountryCard } from '@/components/country/country-card';
import { useTranslations } from 'next-intl';
import type { Country } from '@/types/country';

const countries: Country[] = [
  { id: '1', slug: 'turkey', name_az: 'Türkiyə', name_ru: 'Турция', name_en: 'Turkey', flag_emoji: '🇹🇷', description_az: 'İstanbul, Antalya, Kapadokya və daha çoxu', description_ru: 'Стамбул, Анталья, Каппадокия и многое другое', description_en: 'Istanbul, Antalya, Cappadocia and more', best_time: 'Apr-May, Sep-Nov', avg_costs: { flight: '150 AZN', hotel: '60 AZN', daily: '80 AZN' }, popular_places: ['İstanbul', 'Antalya', 'Kapadokya'] },
  { id: '2', slug: 'dubai', name_az: 'Dubai', name_ru: 'Дубай', name_en: 'Dubai', flag_emoji: '🇦🇪', description_az: 'Müasir memarlıq, lüks alış-veriş', description_ru: 'Современная архитектура, роскошный шоппинг', description_en: 'Modern architecture, luxury shopping', best_time: 'Nov-Mar', avg_costs: { flight: '400 AZN', hotel: '150 AZN', daily: '200 AZN' }, popular_places: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'] },
  { id: '3', slug: 'georgia', name_az: 'Gürcüstan', name_ru: 'Грузия', name_en: 'Georgia', flag_emoji: '🇬🇪', description_az: 'Tiflis, Batumi, dağ kəndləri', description_ru: 'Тбилиси, Батуми, горные деревни', description_en: 'Tbilisi, Batumi, mountain villages', best_time: 'May-Oct', avg_costs: { flight: '100 AZN', hotel: '50 AZN', daily: '60 AZN' }, popular_places: ['Tiflis', 'Batumi', 'Kazbegi'] },
  { id: '4', slug: 'japan', name_az: 'Yaponiya', name_ru: 'Япония', name_en: 'Japan', flag_emoji: '🇯🇵', description_az: 'Tokyo, Kyoto, Fuji dağı', description_ru: 'Токио, Киото, гора Фудзи', description_en: 'Tokyo, Kyoto, Mount Fuji', best_time: 'Mar-May, Oct-Nov', avg_costs: { flight: '1200 AZN', hotel: '120 AZN', daily: '150 AZN' }, popular_places: ['Tokyo', 'Kyoto', 'Osaka'] },
  { id: '5', slug: 'thailand', name_az: 'Tailand', name_ru: 'Таиланд', name_en: 'Thailand', flag_emoji: '🇹🇭', description_az: 'Banqkok, Phuket, tropik çimərliklər', description_ru: 'Бангкок, Пхукет, тропические пляжи', description_en: 'Bangkok, Phuket, tropical beaches', best_time: 'Nov-Feb', avg_costs: { flight: '900 AZN', hotel: '40 AZN', daily: '50 AZN' }, popular_places: ['Banqkok', 'Phuket', 'Chiang Mai'] },
  { id: '6', slug: 'italy', name_az: 'İtaliya', name_ru: 'Италия', name_en: 'Italy', flag_emoji: '🇮🇹', description_az: 'Roma, Venesiya, Florensiya', description_ru: 'Рим, Венеция, Флоренция', description_en: 'Rome, Venice, Florence', best_time: 'Apr-Jun, Sep-Oct', avg_costs: { flight: '500 AZN', hotel: '100 AZN', daily: '120 AZN' }, popular_places: ['Roma', 'Venesiya', 'Milan'] },
  { id: '7', slug: 'france', name_az: 'Fransa', name_ru: 'Франция', name_en: 'France', flag_emoji: '🇫🇷', description_az: 'Paris, Luvr, Eyfel qülləsi', description_ru: 'Париж, Лувр, Эйфелева башня', description_en: 'Paris, Louvre, Eiffel Tower', best_time: 'Apr-Jun, Sep-Oct', avg_costs: { flight: '550 AZN', hotel: '130 AZN', daily: '140 AZN' }, popular_places: ['Paris', 'Nice', 'Lyon'] },
  { id: '8', slug: 'russia', name_az: 'Rusiya', name_ru: 'Россия', name_en: 'Russia', flag_emoji: '🇷🇺', description_az: 'Moskva, Sankt-Peterburq', description_ru: 'Москва, Санкт-Петербург', description_en: 'Moscow, Saint Petersburg', best_time: 'Jun-Aug', avg_costs: { flight: '300 AZN', hotel: '70 AZN', daily: '80 AZN' }, popular_places: ['Moskva', 'Sankt-Peterburq'] },
  { id: '9', slug: 'iran', name_az: 'İran', name_ru: 'Иран', name_en: 'Iran', flag_emoji: '🇮🇷', description_az: 'Tehran, İsfahan, Şiraz', description_ru: 'Тегеран, Исфахан, Шираз', description_en: 'Tehran, Isfahan, Shiraz', best_time: 'Mar-May, Sep-Nov', avg_costs: { flight: '200 AZN', hotel: '30 AZN', daily: '40 AZN' }, popular_places: ['Tehran', 'İsfahan', 'Şiraz'] },
  { id: '10', slug: 'uk', name_az: 'İngiltərə', name_ru: 'Англия', name_en: 'England', flag_emoji: '🇬🇧', description_az: 'London, Big Ben, Tower Bridge', description_ru: 'Лондон, Биг-Бен, Тауэрский мост', description_en: 'London, Big Ben, Tower Bridge', best_time: 'Jun-Aug', avg_costs: { flight: '600 AZN', hotel: '150 AZN', daily: '160 AZN' }, popular_places: ['London', 'Manchester', 'Oxford'] },
];

export default function CountriesPage() {
  const t = useTranslations('countries');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </div>
  );
}
