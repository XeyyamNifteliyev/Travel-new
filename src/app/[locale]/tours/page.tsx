import { getTranslations } from 'next-intl/server';
import TourList from '@/components/tour/tour-list';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tours' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function ToursPage() {
  return <TourList />;
}
