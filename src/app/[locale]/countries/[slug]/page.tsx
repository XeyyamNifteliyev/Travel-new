import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CountryDetailClient from './country-detail-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('name_az, short_desc')
    .eq('slug', slug)
    .single();

  return {
    title: data?.name_az ? `${data.name_az} — TravelAZ` : 'Ölkə',
    description: data?.short_desc || '',
  };
}

export default async function CountryDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const supabase = await createClient();

  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!country) notFound();

  const { data: highlights } = await supabase
    .from('country_highlights')
    .select('*')
    .eq('country_id', country.id)
    .order('rank');

  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, cover_image, created_at, views, profiles(display_name)')
    .ilike('content', `%${country.name_az}%`)
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: visaCheck } = await supabase
    .from('visa_info')
    .select('id')
    .eq('country_id', country.id)
    .maybeSingle();

  return (
    <CountryDetailClient
      country={country}
      highlights={(highlights as any) || []}
      blogs={(blogs as any) || []}
      locale={locale}
      hasVisaInfo={!!visaCheck}
    />
  );
}

export const revalidate = 86400;
