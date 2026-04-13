import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AIPlannerPage from './ai-planner-client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiPlanner' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function AIPlannerRoute() {
  return <AIPlannerPage />;
}
