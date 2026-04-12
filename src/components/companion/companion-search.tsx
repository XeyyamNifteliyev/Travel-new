'use client';

import { useState, useEffect, useMemo } from 'react';
import { Companion, CompanionFormData } from '@/types/companion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  Search, MapPin, Calendar, Users, Heart,
  X, Plus, Loader2, Globe, User, MessageCircle
} from 'lucide-react';

const REGIONS = [
  'Türkiyə', 'Dubai', 'Rusiya', 'Gürcüstan', 'İran',
  'Tailand', 'Yaponiya', 'Almaniya', 'Fransa', 'İtaliya',
  'İspaniya', 'Misir', 'Maldiv', 'Bali', 'Koreya'
];

const INTERESTS = [
  'Təbiət', 'Şəhər', 'Qastro', 'Mədəniyyət', 'Fotoqrafiya',
  'Sərgi', 'Musiqi', 'İdman', 'Alış-veriş', 'Dəniz'
];

const LANGUAGES = ['az', 'ru', 'en', 'tr', 'ar'];

export default function CompanionSearch() {
  const t = useTranslations('companions');
  const locale = useLocale();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    departureDate: '',
    genderPreference: 'any' as const,
    ageMin: '',
    ageMax: '',
    interests: [] as string[],
    languages: [] as string[],
  });

  const [formData, setFormData] = useState<CompanionFormData>({
    destinationCountry: '',
    destinationCity: '',
    departureDate: '',
    returnDate: '',
    genderPreference: 'any',
    ageMin: 18,
    ageMax: 50,
    interests: [],
    languages: [],
    description: '',
  });

  useEffect(() => {
    fetchCompanions();
  }, [filters]);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchCompanions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    if (filters.city) params.set('city', filters.city);
    if (filters.departureDate) params.set('departureDate', filters.departureDate);
    if (filters.genderPreference !== 'any') params.set('genderPreference', filters.genderPreference);
    if (filters.ageMin) params.set('ageMin', filters.ageMin.toString());
    if (filters.ageMax) params.set('ageMax', filters.ageMax.toString());
    if (filters.interests.length) params.set('interests', filters.interests.join(','));
    if (filters.languages.length) params.set('languages', filters.languages.join(','));

    const res = await fetch(`/api/companions?${params}`);
    const data = await res.json();
    const mapped = (data.companions || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      destinationCountry: c.destination_country,
      destinationCity: c.destination_city,
      departureDate: c.departure_date,
      returnDate: c.return_date,
      genderPreference: c.gender_preference,
      ageMin: c.age_min,
      ageMax: c.age_max,
      interests: c.interests || [],
      languages: c.languages || [],
      description: c.description,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author: c.author ? { name: c.author.name, avatarUrl: c.author.avatar_url } : undefined,
    }));
    setCompanions(mapped);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    const res = await fetch('/api/companions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowForm(false);
      fetchCompanions();
      setFormData({
        destinationCountry: '',
        destinationCity: '',
        departureDate: '',
        returnDate: '',
        genderPreference: 'any',
        ageMin: 18,
        ageMax: 50,
        interests: [],
        languages: [],
        description: '',
      });
    } else {
      const errorData = await res.json();
      console.error('Companion creation error:', errorData);
      alert(errorData.error || 'Xəta baş verdi');
    }
  }

  function toggleInterest(interest: string) {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  }

  function toggleLanguage(lang: string) {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  }

  async function handleSendMessage(adOwnerId: string, adId: string) {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (user.id === adOwnerId) {
      alert(t('cannotSelfMessage'));
      return;
    }

    setMessagingId(adId);

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_id', adId)
      .eq('ad_owner_id', adOwnerId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      router.push(`/${locale}/chat?conv=${existing.id}`);
      setMessagingId(null);
      return;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ ad_id: adId, ad_owner_id: adOwnerId, user_id: user.id })
      .select('id')
      .single();

    if (error) {
      alert(t('cannotSelfMessage'));
      setMessagingId(null);
      return;
    }

    router.push(`/${locale}/chat?conv=${data.id}`);
    setMessagingId(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-txt flex items-center gap-3">
              <Users className="w-8 h-8 text-sky-400" />
              {t('title')}
            </h1>
            <p className="text-txt-sec mt-1">{t('subtitle')}</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {showForm ? t('cancel') : t('createPost')}
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-txt">{t('createPost')}</h2>
              <button onClick={() => setShowForm(false)} className="text-txt-sec hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('destinationCountry')}
                  </label>
                  <select
                    value={formData.destinationCountry}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('selectCountry')}</option>
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">
                    {t('destinationCity')}
                  </label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder={t('cityPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('departureDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">
                    {t('returnDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={e => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">
                    {t('interests')}
                  </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-sky-500 text-white'
                          : 'bg-bg-input text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    {t('languages')}
                  </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-bg-input text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">
                    {t('description')}
                  </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
              >
                {t('publish')}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-sec" />
                <select
                  value={filters.country}
                  onChange={e => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-txt"
                >
                  <option value="">{t('allCountries')}</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="date"
              value={filters.departureDate}
              onChange={e => setFilters(prev => ({ ...prev, departureDate: e.target.value }))}
              className="bg-bg-input border border-border rounded-xl px-4 py-2.5 text-txt"
            />
            <select
              value={filters.genderPreference}
              onChange={e => setFilters(prev => ({ ...prev, genderPreference: e.target.value as any }))}
              className="bg-bg-input border border-border rounded-xl px-4 py-2.5 text-txt"
            >
              <option value="any">{t('anyGender')}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        ) : companions.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-txt-muted mx-auto mb-4" />
            <p className="text-txt-sec text-lg">{t('noCompanions')}</p>
            <p className="text-txt-muted text-sm mt-1">{t('noCompanionsSub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companions.map(companion => (
              <div
                key={companion.id}
                className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-5 hover:border-sky-500/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-txt font-medium">{companion.author?.name || 'Anonim'}</h3>
                    <div className="flex items-center gap-1 text-txt-sec text-sm">
                      <MapPin className="w-3 h-3" />
                      {companion.destinationCountry}
                      {companion.destinationCity && `, ${companion.destinationCity}`}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    {t('open')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-txt-sec">
                    <Calendar className="w-4 h-4 text-txt-muted" />
                    {formatDate(companion.departureDate)}
                    {companion.returnDate && ` → ${formatDate(companion.returnDate)}`}
                  </div>
                  {companion.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {companion.interests.map(i => (
                        <span key={i} className="px-2 py-0.5 bg-bg-input text-txt-sec text-xs rounded-full">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}
                  {companion.languages.length > 0 && (
                    <div className="flex items-center gap-1">
                       <Globe className="w-3 h-3 text-txt-muted" />
                      {companion.languages.map(l => (
                        <span key={l} className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                          {l.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                  {companion.description && (
                  <p className="text-txt-sec text-sm mb-4 line-clamp-2">{companion.description}</p>
                )}

                <button
                  onClick={() => handleSendMessage(companion.userId, companion.id)}
                  disabled={messagingId === companion.id}
                  className="w-full py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {messagingId === companion.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  {messagingId === companion.id ? t('sending') : t('sendMessage')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
