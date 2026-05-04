'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Companion, CompanionFormData } from '@/types/companion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/supabase-helpers';
import {
  Search, MapPin, Calendar, Users,
  X, Plus, Loader2, Globe, MessageCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = ['az', 'ru', 'en', 'tr', 'ar'];

const COVER_GRADIENTS = [
  'from-sky-600 via-blue-700 to-indigo-900',
  'from-emerald-600 via-teal-700 to-cyan-900',
  'from-violet-600 via-purple-700 to-indigo-900',
  'from-amber-600 via-orange-700 to-red-900',
  'from-rose-600 via-pink-700 to-fuchsia-900',
  'from-cyan-600 via-sky-700 to-blue-900',
];

export default function CompanionSearch() {
  const t = useTranslations('companions');
  const locale = useLocale();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);

  const REGIONS: string[] = useMemo(() => t.raw('regions'), [t]);
  const INTERESTS: string[] = useMemo(() => t.raw('interestOptions'), [t]);
  const MONTHS_SHORT: string[] = useMemo(() => t.raw('months'), [t]);
  const MONTHS_FULL: string[] = useMemo(() => t.raw('monthsFull'), [t]);

  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [filters, setFilters] = useState<{
    country: string;
    city: string;
    departureDate: string;
    genderPreference: 'any' | 'male' | 'female';
    ageMin: string;
    ageMax: string;
    interests: string[];
    languages: string[];
  }>({
    country: '',
    city: '',
    departureDate: '',
    genderPreference: 'any',
    ageMin: '',
    ageMax: '',
    interests: [],
    languages: [],
  });

  const [formData, setFormData] = useState<CompanionFormData>({
    destinationCountry: '',
    destinationCity: '',
    departureDate: '',
    returnDate: '',
    genderPreference: 'any',
    gender: undefined,
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
    const mapped = (data.companions || []).map((c: {
      id: string;
      user_id: string;
      destination_country: string;
      destination_city: string | null;
      departure_date: string;
      return_date: string | null;
      gender_preference: string;
      gender: string | null;
      age_min: number;
      age_max: number;
      interests: string[];
      languages: string[];
      description: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      author: { name: string; avatar_url: string } | null;
    }) => ({
      id: c.id,
      userId: c.user_id,
      destinationCountry: c.destination_country,
      destinationCity: c.destination_city,
      departureDate: c.departure_date,
      returnDate: c.return_date,
      genderPreference: c.gender_preference,
      gender: c.gender,
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
        gender: undefined,
        ageMin: 18,
        ageMax: 50,
        interests: [],
        languages: [],
        description: '',
      });
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || t('errorOccurred'));
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
      toast.warning(t('cannotSelfMessage'));
      return;
    }

    setMessagingId(adId);

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_owner_id', adOwnerId)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

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
      toast.error(t('cannotSelfMessage'));
      setMessagingId(null);
      return;
    }

    router.push(`/${locale}/chat?conv=${data.id}`);
    setMessagingId(null);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  function formatDateFull(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-4xl md:text-6xl font-bold text-txt tracking-tight leading-none mb-4">
            {t('heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-300">
              {t('heroHighlight')}
            </span>
          </h1>
          <p className="text-txt-sec max-w-2xl text-base md:text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl mb-8">
          <div className="flex flex-wrap gap-3 md:gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                {t('destinationCountry')}
              </label>
              <div className="relative">
                <select
                  value={filters.country}
                  onChange={e => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-bg-surface/80 border-none rounded-xl py-3 px-4 text-sm text-txt focus:ring-2 focus:ring-primary transition-all appearance-none"
                >
                  <option value="">{t('allCountries')}</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                {t('departureDate')}
              </label>
              <input
                type="date"
                value={filters.departureDate}
                onChange={e => setFilters(prev => ({ ...prev, departureDate: e.target.value }))}
                className="w-full bg-bg-surface/80 border-none rounded-xl py-3 px-4 text-sm text-txt focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                {t('anyGender')}
              </label>
              <select
                value={filters.genderPreference}
                onChange={e => setFilters(prev => ({ ...prev, genderPreference: e.target.value as 'any' | 'male' | 'female' }))}
                className="w-full bg-bg-surface/80 border-none rounded-xl py-3 px-4 text-sm text-txt focus:ring-2 focus:ring-primary transition-all appearance-none"
              >
                <option value="any">{t('anyGender')}</option>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-br from-primary to-sky-400 text-white px-6 py-3 rounded-full font-bold text-sm hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {showForm ? t('cancel') : t('createPost')}
              </button>
            )}
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="glass-panel rounded-2xl p-5 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-txt">{t('createPost')}</h2>
              <button onClick={() => setShowForm(false)} className="text-txt-sec hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                    {t('destinationCountry')}
                  </label>
                  <select
                    value={formData.destinationCountry}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    className="w-full bg-bg-surface/80 border-none rounded-xl px-4 py-3 text-sm text-txt focus:ring-2 focus:ring-primary transition-all"
                    required
                  >
                    <option value="">{t('selectCountry')}</option>
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                    {t('destinationCity')}
                  </label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full bg-bg-surface/80 border-none rounded-xl px-4 py-3 text-sm text-txt focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('cityPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                    {t('departureDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full bg-bg-surface/80 border-none rounded-xl px-4 py-3 text-sm text-txt focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                    {t('returnDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={e => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full bg-bg-surface/80 border-none rounded-xl px-4 py-3 text-sm text-txt focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                    {t('yourGender')}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.gender === 'male'
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {t('male')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.gender === 'female'
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {t('female')}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                  {t('interests')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.interests.includes(interest)
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                  {t('languages')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.languages.includes(lang)
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-bg-surface/80 text-txt-sec hover:bg-bg-surface-hover'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-1.5">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-bg-surface/80 border-none rounded-xl px-4 py-3 text-sm text-txt focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white font-bold hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300"
              >
                {t('publish')}
              </button>
            </form>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-bg-surface/50 rounded-xl overflow-hidden">
                <div className="h-28 bg-bg-surface/30" />
                <div className="p-4 pt-6">
                  <div className="w-10 h-10 rounded-full bg-bg-surface/30 mb-3" />
                  <div className="h-4 bg-bg-surface/30 rounded w-24 mb-2" />
                  <div className="h-3 bg-bg-surface/30 rounded w-32 mb-2" />
                  <div className="h-3 bg-bg-surface/30 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : companions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-bg-surface/50 flex items-center justify-center">
              <Users className="w-10 h-10 text-txt-muted/40" />
            </div>
            <p className="text-txt-sec text-lg font-medium">{t('noCompanions')}</p>
            <p className="text-txt-muted text-sm mt-1">{t('noCompanionsSub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companions.map((companion, index) => {
              const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
              const initial = companion.author?.name?.[0]?.toUpperCase() || '?';

              return (
                <div
                  key={companion.id}
                  onClick={() => setSelectedCompanion(companion)}
                  className="group relative bg-bg-surface/50 rounded-2xl overflow-hidden hover:shadow-[0_12px_30px_rgba(14,165,233,0.1)] transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20"
                >
                  <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-3 left-4 right-3 flex items-end justify-between">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] tracking-wide rounded-full font-semibold uppercase">
                        {companion.destinationCountry}
                      </span>
                      <span className="text-white/80 text-[11px] tracking-wide font-medium">
                        {formatDate(companion.departureDate)}
                        {companion.returnDate && ` — ${formatDate(companion.returnDate)}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 pb-5 relative">
                    <div className="absolute -top-7 left-4">
                      {companion.author?.avatarUrl ? (
                        <Image
                          src={companion.author.avatarUrl}
                          alt={companion.author.name}
                          className="w-14 h-14 rounded-full border-[3px] border-bg-base object-cover"
                          width={56}
                          height={56}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full border-[3px] border-bg-base bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl font-bold text-primary tracking-tight">
                          {initial}
                        </div>
                      )}
                    </div>

                    <div className="pt-8">
                      <h3 className="text-[15px] font-bold text-txt tracking-tight truncate">
                        {companion.author?.name || t('anonymous')}
                      </h3>

                      {companion.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                          {companion.interests.slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] tracking-wide font-semibold rounded-full">
                              {interest}
                            </span>
                          ))}
                          {companion.interests.length > 3 && (
                            <span className="px-2 py-0.5 bg-white/5 text-txt-muted text-[10px] tracking-wide font-medium rounded-full">
                              +{companion.interests.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {companion.description && (
                        <p className="text-txt-sec text-[13px] font-normal leading-relaxed line-clamp-2 mb-3 tracking-wide">
                          {companion.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {companion.languages.length > 0 && (
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] tracking-widest font-bold rounded-full uppercase">
                            {companion.languages.map(l => l.toUpperCase()).join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCompanion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCompanion(null)}
        >
          <div
            className="w-full max-w-lg bg-bg-base border border-border rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Cover */}
            <div className={`h-40 bg-gradient-to-br ${COVER_GRADIENTS[companions.indexOf(selectedCompanion) % COVER_GRADIENTS.length]} relative flex-shrink-0`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <button
                onClick={() => setSelectedCompanion(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <span className="inline-block px-3.5 py-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] tracking-wide rounded-full font-semibold uppercase">
                  {selectedCompanion.destinationCountry}
                  {selectedCompanion.destinationCity && `, ${selectedCompanion.destinationCity}`}
                </span>
              </div>
            </div>

            {/* Modal Content - scrollable area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-5 relative">
                {/* Avatar */}
                <div className="absolute -top-8 left-5">
                  {selectedCompanion.author?.avatarUrl ? (
                    <Image
                      src={selectedCompanion.author.avatarUrl}
                      alt={selectedCompanion.author.name}
                      className="w-16 h-16 rounded-full border-[3px] border-bg-base object-cover shadow-lg"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-[3px] border-bg-base bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary tracking-tight shadow-lg">
                      {selectedCompanion.author?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                <div className="pt-10">
                  <h2 className="text-xl font-bold text-txt tracking-tight">
                    {selectedCompanion.author?.name || t('anonymous')}
                  </h2>

                  {/* Interest tags */}
                  {selectedCompanion.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                      {selectedCompanion.interests.map(i => (
                        <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] tracking-wide font-semibold rounded-full">{i}</span>
                      ))}
                    </div>
                  )}

                  {/* Info cards */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 rounded-xl border border-border/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-txt-muted uppercase tracking-widest font-medium">{t('destinationCountry')}</p>
                        <p className="text-sm text-txt font-semibold tracking-wide truncate">
                          {selectedCompanion.destinationCountry}
                          {selectedCompanion.destinationCity && `, ${selectedCompanion.destinationCity}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 rounded-xl border border-border/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-txt-muted uppercase tracking-widest font-medium">{t('departureDate')}</p>
                        <p className="text-sm text-txt font-semibold tracking-wide">
                          {formatDateFull(selectedCompanion.departureDate)}
                          {selectedCompanion.returnDate && ` — ${formatDateFull(selectedCompanion.returnDate)}`}
                        </p>
                      </div>
                    </div>
                    {selectedCompanion.languages.length > 0 && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 rounded-xl border border-border/50">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-txt-muted uppercase tracking-widest font-medium">{t('languages')}</p>
                          <p className="text-sm text-txt font-semibold tracking-wide uppercase">
                            {selectedCompanion.languages.map(l => l.toUpperCase()).join(' · ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedCompanion.description && (
                    <div className="mb-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-txt-muted mb-2.5">{t('details')}</h4>
                      <div className="bg-bg-surface/50 rounded-xl p-4 border border-border/30">
                        <p className="text-txt-sec text-[13px] leading-relaxed break-words whitespace-pre-wrap tracking-wide">
                          {selectedCompanion.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message CTA */}
                  <button
                    onClick={() => handleSendMessage(selectedCompanion.userId, selectedCompanion.id)}
                    disabled={messagingId === selectedCompanion.id}
                    className="w-full py-3.5 rounded-full bg-gradient-to-br from-primary to-sky-400 text-white font-bold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {messagingId === selectedCompanion.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {messagingId === selectedCompanion.id ? t('sending') : t('sendMessage')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
