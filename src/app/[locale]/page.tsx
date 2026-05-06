import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  BedDouble,
  Bot,
  Building2,
  CalendarDays,
  Compass,
  HeartHandshake,
  Landmark,
  Map,
  MapPin,
  MessageCircle,
  Newspaper,
  Plane,
  ShieldCheck,
  Sparkles,
  Stamp,
  Star,
  Utensils,
  Users,
} from 'lucide-react';
import { GlobeHero } from '@/components/home/globe-hero';
import { HomeSearchPanel } from '@/components/home/home-search-panel';
import { createClient } from '@/lib/supabase/server';
import { getUnsplashUrl, getCountryCoverPhotoId, getCityCoverPhotoId } from '@/lib/unsplash';
import type { ExpandedCountry } from '@/types/country';
import type { PlaceCategory } from '@/types/place';

export const revalidate = 3600;

type Locale = 'az' | 'en' | 'ru';

type HomeTour = {
  id: string;
  title: string;
  slug: string;
  region: string;
  price: number;
  duration_days: number;
  images?: string[];
  rating?: number;
};

type HomeBlog = {
  id: string;
  title: string;
  cover_image?: string;
  views?: number;
  likes?: number;
  created_at: string;
};

type HomeCountryRef = {
  id: string;
  slug: string;
  name_az: string;
  name_en: string | null;
  name_ru: string | null;
  flag_emoji?: string | null;
  cover_photo_id?: string | null;
};

type HomeCity = {
  id: string;
  slug: string;
  name_az: string;
  name_en: string | null;
  name_ru: string | null;
  population: number | null;
  cover_photo_id: string | null;
  countries?: HomeCountryRef | null;
};

type HomePlace = {
  id: string;
  slug: string;
  name: string;
  name_az: string | null;
  name_en: string | null;
  name_ru: string | null;
  category: PlaceCategory;
  cover_photo_id: string | null;
  cover_photo_url: string | null;
  rating_summary: number;
  review_count: number;
  popular_rank: number;
  cities?: (HomeCity & { cover_photo_id: string | null }) | null;
  countries?: HomeCountryRef | null;
};

const fallbackCountries: ExpandedCountry[] = [
  {
    id: 'turkey',
    slug: 'turkey',
    name_az: 'Turkiye',
    name_en: 'Turkey',
    name_ru: 'Турция',
    flag_emoji: 'TR',
    capital: 'Ankara',
    avg_flight_azn: 199,
    avg_hotel_azn: 120,
    cover_photo_id: '1524231757912-21f4fe3a7200',
    short_desc: 'Istanbul, Kapadokya ve Ege sahilleri ile yaxin ve rahat istiqamet.',
    short_desc_en: 'A close favorite with Istanbul, Cappadocia, and the Aegean coast.',
    short_desc_ru: 'Близкое направление со Стамбулом, Каппадокией и Эгейским побережьем.',
    visa_required: false,
    best_months: ['apr', 'may', 'sep', 'oct'],
    popular_rank: 1,
  },
  {
    id: 'uae',
    slug: 'uae',
    name_az: 'BAE',
    name_en: 'UAE',
    name_ru: 'ОАЭ',
    flag_emoji: 'AE',
    capital: 'Abu Dhabi',
    avg_flight_azn: 399,
    avg_hotel_azn: 220,
    cover_photo_id: '1512453979798-5ea266f8880c',
    short_desc: 'Dubai, sehra turlari, luks oteller ve aile eylenceleri.',
    short_desc_en: 'Dubai, desert tours, luxury hotels, and family entertainment.',
    short_desc_ru: 'Дубай, пустынные туры, роскошные отели и семейный отдых.',
    visa_required: true,
    best_months: ['nov', 'dec', 'jan', 'feb'],
    popular_rank: 2,
  },
  {
    id: 'georgia',
    slug: 'georgia',
    name_az: 'Gurcustan',
    name_en: 'Georgia',
    name_ru: 'Грузия',
    flag_emoji: 'GE',
    capital: 'Tbilisi',
    avg_flight_azn: 99,
    avg_hotel_azn: 85,
    cover_photo_id: '1565008576549-57569a49371d',
    short_desc: 'Tbilisi, daglar, qastro tecrubeler ve vizasiz yaxin sefer.',
    short_desc_en: 'Tbilisi, mountains, food trips, and visa-free nearby escapes.',
    short_desc_ru: 'Тбилиси, горы, гастро-поездки и безвизовое близкое направление.',
    visa_required: false,
    best_months: ['may', 'jun', 'sep', 'oct'],
    popular_rank: 3,
  },
  {
    id: 'japan',
    slug: 'japan',
    name_az: 'Yaponiya',
    name_en: 'Japan',
    name_ru: 'Япония',
    flag_emoji: 'JP',
    capital: 'Tokyo',
    avg_flight_azn: 1199,
    avg_hotel_azn: 180,
    cover_photo_id: '1493976040374-85c8e12f0c0e',
    short_desc: 'Tokyo, Kyoto, sakura movsumu ve cox qatli medeni seyahat.',
    short_desc_en: 'Tokyo, Kyoto, cherry blossoms, and a layered cultural trip.',
    short_desc_ru: 'Токио, Киото, сакура и насыщенное культурное путешествие.',
    visa_required: true,
    best_months: ['mar', 'apr', 'oct', 'nov'],
    popular_rank: 4,
  },
];

const placeIdeas = [
  { icon: Compass, title: 'Attractions', label: 'OpenStreetMap POI', color: 'text-primary' },
  { icon: BedDouble, title: 'Hotels', label: 'Real API ready', color: 'text-secondary' },
  { icon: HeartHandshake, title: 'Restaurants', label: 'Community reviews', color: 'text-accent' },
  { icon: MessageCircle, title: 'Forums', label: 'TravelAZ icma', color: 'text-sky-300' },
];

function localizedCountryName(country: ExpandedCountry, locale: Locale) {
  if (locale === 'en') return country.name_en || country.name_az;
  if (locale === 'ru') return country.name_ru || country.name_az;
  return country.name_az || country.name_en;
}

function localizedCountryDescription(country: ExpandedCountry, locale: Locale) {
  if (locale === 'en') return country.short_desc_en || country.short_desc || '';
  if (locale === 'ru') return country.short_desc_ru || country.short_desc || '';
  return country.short_desc || country.short_desc_en || '';
}

function localizedRefName(item: {
  name_az?: string | null;
  name_en?: string | null;
  name_ru?: string | null;
  name?: string | null;
}, locale: Locale) {
  if (locale === 'en') return item.name_en || item.name_az || item.name || '';
  if (locale === 'ru') return item.name_ru || item.name_az || item.name_en || item.name || '';
  return item.name_az || item.name_en || item.name || '';
}

function formatPopulation(value: number | null, locale: Locale) {
  if (!value) return null;
  return new Intl.NumberFormat(locale).format(value);
}

function getPlaceCategoryIcon(category: PlaceCategory) {
  if (category === 'restaurant' || category === 'cafe') return Utensils;
  if (category === 'museum') return Landmark;
  if (category === 'hotel') return BedDouble;
  if (category === 'landmark' || category === 'historic') return Landmark;
  return Building2;
}

function getPlacePhotoId(place: HomePlace) {
  return (
    place.cover_photo_id ||
    (place.cities ? getCityCoverPhotoId(place.cities.slug, null) : null) ||
    (place.countries ? getCountryCoverPhotoId(place.countries.slug, place.countries.cover_photo_id) : null) ||
    place.cities?.cover_photo_id ||
    place.countries?.cover_photo_id
  );
}

async function getHomeData() {
  try {
    const supabase = await createClient();

    const [countriesResult, toursResult, blogsResult, citiesResult, placesResult] = await Promise.all([
      supabase
        .from('countries')
        .select('id, slug, name_az, name_en, name_ru, flag_emoji, capital, continent, cover_photo_id, cover_photo_alt, short_desc, short_desc_en, short_desc_ru, avg_flight_azn, avg_hotel_azn, best_months, visa_required, popular_rank, is_featured, safety_level, cca2')
        .order('is_featured', { ascending: false })
        .order('popular_rank', { ascending: true })
        .limit(8),
      supabase
        .from('tours')
        .select('id, title, slug, region, price, duration_days, images, rating')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('blogs')
        .select('id, title, cover_image, views, likes, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('cities')
        .select('id, slug, name_az, name_en, name_ru, population, cover_photo_id, countries(id, slug, name_az, name_en, name_ru, flag_emoji, cover_photo_id)')
        .order('is_featured', { ascending: false })
        .order('popular_rank', { ascending: true })
        .order('population', { ascending: false })
        .limit(4),
      supabase
        .from('places')
        .select('id, slug, name, name_az, name_en, name_ru, category, cover_photo_id, cover_photo_url, rating_summary, review_count, popular_rank, cities(id, slug, name_az, name_en, name_ru, population, cover_photo_id), countries(id, slug, name_az, name_en, name_ru, flag_emoji, cover_photo_id)')
        .eq('status', 'active')
        .in('category', ['attraction', 'museum', 'landmark', 'restaurant', 'cafe', 'historic', 'viewpoint'])
        .order('is_featured', { ascending: false })
        .order('popular_rank', { ascending: true })
        .limit(8),
    ]);

    return {
      countries: ((countriesResult.data as ExpandedCountry[] | null) || []).length > 0
        ? (countriesResult.data as ExpandedCountry[])
        : fallbackCountries,
      tours: (toursResult.data as HomeTour[] | null) || [],
      blogs: (blogsResult.data as HomeBlog[] | null) || [],
      cities: (citiesResult.data as HomeCity[] | null) || [],
      places: (placesResult.data as HomePlace[] | null) || [],
    };
  } catch {
    return {
      countries: fallbackCountries,
      tours: [] as HomeTour[],
      blogs: [] as HomeBlog[],
      cities: [] as HomeCity[],
      places: [] as HomePlace[],
    };
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const { countries, tours, blogs, cities, places } = await getHomeData();

  return (
    <div className="overflow-hidden">
      <section className="relative px-4 pt-28 pb-14 md:pt-36 md:pb-20 min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/50 to-bg-base" />
        <div className="max-w-7xl mx-auto">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                {t('heroEyebrow')}
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl drop-shadow-lg">
                {t('heroTitleNew')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-secondary">
                  {t('heroHighlightNew')}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg drop-shadow">
                {t('heroSubtitleNew')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/ai-planner`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Bot className="h-4 w-4" />
                  {t('ctaPlanner')}
                </Link>
                <Link
                  href={`/${locale}/countries`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-white/20"
                >
                  <Map className="h-4 w-4" />
                  {t('ctaCountries')}
                </Link>
                <Link
                  href={`/${locale}/visa`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-secondary/60 hover:bg-white/20"
                >
                  <Stamp className="h-4 w-4" />
                  {t('ctaVisa')}
                </Link>
              </div>
            </div>

            <div className="relative min-h-[300px] md:min-h-[460px] max-w-full">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <GlobeHero />
              </div>
              

            </div>
          </div>

          <div className="mt-10">
            <HomeSearchPanel />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { icon: Plane, title: common('flights'), text: t('serviceFlights'), href: '/flights' },
            { icon: BedDouble, title: common('hotels'), text: t('serviceHotels'), href: '/hotels' },
            { icon: Compass, title: t('thingsToDo'), text: t('servicePlaces'), href: '/countries' },
            { icon: Users, title: common('companions'), text: t('serviceCommunity'), href: '/companions' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={`/${locale}${item.href}`}
                className="group rounded-2xl border border-border bg-bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-txt">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-txt-sec">{item.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">{t('destinationsEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-txt md:text-4xl">{t('popularDestinations')}</h2>
          </div>
          <Link href={`/${locale}/countries`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            {t('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((country) => {
            const photoId = getCountryCoverPhotoId(country.slug, country.cover_photo_id);
            return (
              <Link
                key={country.id}
                href={`/${locale}/countries/${country.slug}`}
                className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-lg"
              >
                <Image
                  src={getUnsplashUrl(photoId, { w: 900, h: 1100, q: 78 })}
                  alt={country.cover_photo_alt || localizedCountryName(country, locale)}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900">
                  {country.visa_required ? t('visaRequired') : t('visaFree')}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-widest text-white/70">{country.capital || country.continent}</p>
                  <h3 className="mt-1 text-2xl font-black">{localizedCountryName(country, locale)}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/78">
                    {localizedCountryDescription(country, locale)}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                    <span>{t('from')} {country.avg_flight_azn || 0} AZN</span>
                    <span>{country.avg_hotel_azn || 0} AZN/{t('night')}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-secondary">{t('plannerEyebrow')}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-txt md:text-4xl">{t('plannerTitle')}</h2>
            <p className="mt-4 leading-7 text-txt-sec">{t('plannerText')}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Bot, label: t('plannerPointAi') },
                { icon: CalendarDays, label: t('plannerPointCheap') },
                { icon: Stamp, label: t('plannerPointVisa') },
                { icon: ShieldCheck, label: t('plannerPointSafe') },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-bg-base/60 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-txt">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <Link
              href={`/${locale}/ai-planner`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              {t('ctaPlanner')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">{t('popularCities')}</p>
                <p className="mt-1 text-sm text-txt-sec">{t('popularCitiesSub')}</p>
              </div>
              <Link href={`/${locale}/cities`} className="hidden items-center gap-2 text-sm font-bold text-primary sm:inline-flex">
                {t('viewAllCities')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {cities.map((city) => {
                const cityName = localizedRefName(city, locale);
                const countryName = city.countries ? localizedRefName(city.countries, locale) : '';
                const population = formatPopulation(city.population, locale);

                return (
                  <Link
                    key={city.id}
                    href={`/${locale}/cities/${city.slug}`}
                    className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-lg"
                  >
                    <Image
                      src={getUnsplashUrl(getCityCoverPhotoId(city.slug, city.cover_photo_id), { w: 760, h: 560, q: 78 })}
                      alt={cityName}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900">
                      <MapPin className="h-3.5 w-3.5" />
                      {countryName}
                    </div>
                    <div className="absolute bottom-0 p-5 text-white">
                      <h3 className="text-2xl font-black">{cityName}</h3>
                      {population && (
                        <p className="mt-2 text-sm text-white/75">{population} {t('population')}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
              <Link
                href={`/${locale}/cities`}
                className="group flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 text-primary transition-all hover:border-primary/60 hover:bg-primary/10"
              >
                <div className="text-center">
                  <Map className="mx-auto mb-2 h-8 w-8 text-primary/60 transition-colors group-hover:text-primary" />
                  <span className="text-sm font-bold">{t('viewAllCities')}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent">{t('placesEyebrow')}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-txt md:text-4xl">{t('placesTitle')}</h2>
              <p className="mt-3 max-w-2xl text-txt-sec">{t('placesText')}</p>
            </div>
            <Link href={`/${locale}/countries`} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-txt hover:text-primary">
              {t('explorePlaces')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {places.length > 0 ? places.map((place) => {
              const Icon = getPlaceCategoryIcon(place.category);
              const placeName = localizedRefName(place, locale);
              const cityName = place.cities ? localizedRefName(place.cities, locale) : '';
              const countryName = place.countries ? localizedRefName(place.countries, locale) : '';
              const photoId = getPlacePhotoId(place);

              return (
                <Link
                  key={place.id}
                  href={`/${locale}/places/${place.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-bg-base/50 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {place.cover_photo_url ? (
                      <Image
                        src={place.cover_photo_url}
                        alt={placeName}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Image
                        src={getUnsplashUrl(photoId || getCountryCoverPhotoId('turkey', null), { w: 680, h: 520, q: 78 })}
                        alt={placeName}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-900">
                      <Icon className="h-3.5 w-3.5" />
                      {place.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-txt-muted">{cityName || countryName}</p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-txt">{placeName}</h3>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-txt-sec">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                        {place.rating_summary?.toFixed(1) || '0.0'}
                      </span>
                      <span>{place.review_count || 0} {common('reviews')}</span>
                    </div>
                  </div>
                </Link>
              );
            }) : placeIdeas.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-border bg-bg-base/50 p-5">
                  <Icon className={`h-7 w-7 ${item.color}`} />
                  <h3 className="mt-5 font-black text-txt">{item.title}</h3>
                  <p className="mt-2 text-sm text-txt-sec">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">{common('tours')}</p>
                <h2 className="mt-2 text-3xl font-black text-txt">{t('tourTitle')}</h2>
              </div>
              <Link href={`/${locale}/tours`} className="text-sm font-bold text-primary">{t('viewAll')}</Link>
            </div>
            <div className="space-y-3">
              {(tours.length ? tours : [
                { id: 'fallback-tour-1', title: t('fallbackTourOne'), slug: 'gabala-weekend', region: 'Qabala', price: 89, duration_days: 2, rating: 4.8 },
                { id: 'fallback-tour-2', title: t('fallbackTourTwo'), slug: 'sheki-culture', region: 'Sheki', price: 110, duration_days: 2, rating: 4.7 },
              ]).map((tour) => (
                <Link
                  key={tour.id}
                  href={`/${locale}/tours`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-surface p-5 transition-all hover:border-primary/30"
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-txt-muted">{tour.region}</p>
                    <h3 className="mt-1 font-black text-txt">{tour.title}</h3>
                    <p className="mt-2 text-sm text-txt-sec">{tour.duration_days} {t('days')} · {tour.rating || 4.7} <Star className="inline h-3 w-3 fill-secondary text-secondary" /></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{tour.price} AZN</p>
                    <p className="text-xs text-txt-muted">{t('perPerson')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-secondary">{common('blog')}</p>
                <h2 className="mt-2 text-3xl font-black text-txt">{t('communityTitle')}</h2>
              </div>
              <Link href={`/${locale}/blog`} className="text-sm font-bold text-primary">{t('viewAll')}</Link>
            </div>
            <div className="grid gap-3">
              {(blogs.length ? blogs : [
                { id: 'fallback-blog-1', title: t('fallbackBlogOne'), created_at: new Date().toISOString(), views: 0, likes: 0 },
                { id: 'fallback-blog-2', title: t('fallbackBlogTwo'), created_at: new Date().toISOString(), views: 0, likes: 0 },
                { id: 'fallback-blog-3', title: t('fallbackBlogThree'), created_at: new Date().toISOString(), views: 0, likes: 0 },
              ]).map((blog) => (
                <Link
                  key={blog.id}
                  href={blog.id.startsWith('fallback') ? `/${locale}/blog` : `/${locale}/blog/${blog.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-bg-surface p-4 transition-all hover:border-secondary/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-txt">{blog.title}</h3>
                    <p className="mt-1 text-sm text-txt-sec">{blog.views || 0} {t('views')} · {blog.likes || 0} {t('likes')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-txt-muted" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-300">{t('finalEyebrow')}</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">{t('finalTitle')}</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">{t('finalText')}</p>
            </div>
            <Link
              href={`/${locale}/visa`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-slate-950"
            >
              <ShieldCheck className="h-5 w-5" />
              {t('finalCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
