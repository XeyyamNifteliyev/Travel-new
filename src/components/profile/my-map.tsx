'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, UserCountryItem } from '@/types/supabase-helpers';
import { Globe, Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/ui/confirm-dialog';

const COUNTRIES = [
  { slug: 'turkiye', flag: '🇹🇷' },
  { slug: 'russia', flag: '🇷🇺' },
  { slug: 'georgia', flag: '🇬🇪' },
  { slug: 'iran', flag: '🇮🇷' },
  { slug: 'uae', flag: '🇦🇪' },
  { slug: 'thailand', flag: '🇹🇭' },
  { slug: 'japan', flag: '🇯🇵' },
  { slug: 'germany', flag: '🇩🇪' },
  { slug: 'france', flag: '🇫🇷' },
  { slug: 'italy', flag: '🇮🇹' },
  { slug: 'spain', flag: '🇪🇸' },
  { slug: 'egypt', flag: '🇪🇬' },
  { slug: 'maldives', flag: '🇲🇻' },
  { slug: 'indonesia', flag: '🇮🇩' },
  { slug: 'south-korea', flag: '🇰🇷' },
  { slug: 'usa', flag: '🇺🇸' },
  { slug: 'uk', flag: '🇬🇧' },
  { slug: 'azerbaijan', flag: '🇦🇿' },
];

const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  turkiye: { az: 'Türkiyə', en: 'Turkey', ru: 'Турция' },
  russia: { az: 'Rusiya', en: 'Russia', ru: 'Россия' },
  georgia: { az: 'Gürcüstan', en: 'Georgia', ru: 'Грузия' },
  iran: { az: 'İran', en: 'Iran', ru: 'Иран' },
  uae: { az: 'Dubai', en: 'Dubai', ru: 'Дубай' },
  thailand: { az: 'Tailand', en: 'Thailand', ru: 'Таиланд' },
  japan: { az: 'Yaponiya', en: 'Japan', ru: 'Япония' },
  germany: { az: 'Almaniya', en: 'Germany', ru: 'Германия' },
  france: { az: 'Fransa', en: 'France', ru: 'Франция' },
  italy: { az: 'İtaliya', en: 'Italy', ru: 'Италия' },
  spain: { az: 'İspaniya', en: 'Spain', ru: 'Испания' },
  egypt: { az: 'Misir', en: 'Egypt', ru: 'Египет' },
  maldives: { az: 'Maldiv', en: 'Maldives', ru: 'Мальдивы' },
  indonesia: { az: 'Bali', en: 'Bali', ru: 'Бали' },
  'south-korea': { az: 'Koreya', en: 'Korea', ru: 'Корея' },
  usa: { az: 'ABŞ', en: 'USA', ru: 'США' },
  uk: { az: 'İngiltərə', en: 'UK', ru: 'Англия' },
  azerbaijan: { az: 'Azərbaycan', en: 'Azerbaijan', ru: 'Азербайджан' },
};

export function MyMap() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const supabase = createClient();
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [countries, setCountries] = useState<UserCountryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('user_countries')
        .select('*')
        .eq('user_id', user.id)
        .order('visited_at', { ascending: false });

      if (data) setCountries(data as UserCountryItem[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!selectedCountry || !user) return;
    setAdding(true);
    await supabase.from('user_countries').insert({
      user_id: user.id,
      country_slug: selectedCountry,
      visited_at: visitDate || null,
    });
    const { data } = await supabase
      .from('user_countries')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false });
    if (data) setCountries(data as UserCountryItem[]);
    setShowAdd(false);
    setSelectedCountry('');
    setVisitDate('');
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: t('deleteCountryTitle'),
      message: t('deleteCountryMsg'),
      confirmText: tc('cancel'),
      cancelText: tc('cancel'),
    });
    if (!confirmed) return;
    const { error } = await supabase.from('user_countries').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      toast.error(t('deleteFailed'));
    } else {
      setCountries((prev) => prev.filter((c) => c.id !== id));
      toast.success(t('deleteCountrySuccess'));
    }
  };

  const getCountryName = (slug: string) => {
    return COUNTRY_NAMES[slug]?.[locale] || COUNTRY_NAMES[slug]?.['az'] || slug;
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-12 bg-bg-surface rounded-xl" /><div className="h-12 bg-bg-surface rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-yellow-400" />
          {t('mapTitle')}
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addCountry')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-bg-surface rounded-xl p-6 border border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">{t('countryLabel')}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">{t('selectCountry')}</option>
              {COUNTRIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.flag} {getCountryName(c.slug)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">{t('travelDateLabel')}</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={adding || !selectedCountry}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {t('addBtn')}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 text-txt-sec hover:text-white transition-colors">
              {tc('cancel')}
            </button>
          </div>
        </div>
      )}

      {countries.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-8 border border-border text-center">
          <MapPin className="w-12 h-12 text-txt-muted mx-auto mb-3" />
          <p className="text-txt-sec mb-4">{t('noCountries')}</p>
          <button onClick={() => setShowAdd(true)} className="text-primary hover:underline">
            {t('addFirstCountry')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {countries.map((country) => {
            const countryInfo = COUNTRIES.find((c) => c.slug === country.country_slug);
            return (
              <div key={country.id} className="bg-bg-surface rounded-xl p-4 border border-border flex items-center justify-between group">
                <div>
                  <span className="text-2xl">{countryInfo?.flag || '🌍'}</span>
                  <p className="text-sm font-medium mt-1">{getCountryName(country.country_slug)}</p>
                  {country.visited_at && (
                    <p className="text-xs text-txt-muted">{new Date(country.visited_at).toLocaleDateString(locale)}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(country.id)}
                   className="p-1 text-txt-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title={t('deleteBtn')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
