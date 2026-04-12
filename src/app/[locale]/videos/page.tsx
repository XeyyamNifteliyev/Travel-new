import { getTranslations } from 'next-intl/server';
import VideoList from '@/components/video/video-list';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'youtube' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function VideosPage() {
  return <VideoList />;
}
