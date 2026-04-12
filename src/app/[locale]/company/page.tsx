import { getTranslations } from 'next-intl/server';
import CompanyRegister from '@/components/company/company-register';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'company' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function CompanyPage() {
  return <CompanyRegister />;
}
