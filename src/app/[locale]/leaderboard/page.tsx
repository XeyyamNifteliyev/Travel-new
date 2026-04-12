import { getTranslations } from 'next-intl/server';
import Leaderboard from '@/components/community/leaderboard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });

  return {
    title: t('topWriters'),
    description: t('leaderboard'),
  };
}

export default function LeaderboardPage() {
  return <Leaderboard />;
}
