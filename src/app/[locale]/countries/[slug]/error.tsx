'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CountryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale || 'az';

  useEffect(() => {
    console.error('Country page error:', { digest: error.digest, msg: error.message });
  }, [error]);

  return (
    <main className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-txt-sec mb-4">
          {locale === 'en' ? 'Failed to load country data' : locale === 'ru' ? 'Не удалось загрузить данные страны' : 'Ölkə məlumatı yüklənə bilmədi'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            {locale === 'en' ? 'Retry' : locale === 'ru' ? 'Повторить' : 'Yenidən'}
          </button>
          <Link href={`/${locale}/countries`} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:border-primary/40 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'en' ? 'All countries' : locale === 'ru' ? 'Все страны' : 'Ölkələr'}
          </Link>
        </div>
      </div>
    </main>
  );
}
