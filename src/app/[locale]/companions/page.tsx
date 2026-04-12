import { getTranslations } from 'next-intl/server';
import CompanionSearch from '@/components/companion/companion-search';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'companions' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function CompanionsPage() {
  return <CompanionSearch />;
}
