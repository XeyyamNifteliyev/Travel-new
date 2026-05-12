'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale || 'az';

  useEffect(() => {
    console.error('Page error:', { digest: error.digest, msg: error.message });
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">
          {locale === 'en' ? 'Something went wrong' : locale === 'ru' ? 'Что-то пошло не так' : 'Bir xəta baş verdi'}
        </h2>
        <p className="text-txt-sec mb-8">
          {locale === 'en' ? 'An unexpected error occurred. Please try again.' : locale === 'ru' ? 'Произошла непредвиденная ошибка. Попробуйте снова.' : 'Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {locale === 'en' ? 'Try again' : locale === 'ru' ? 'Попробовать' : 'Yenidən cəhd et'}
          </button>
          <Link
            href={`/${locale}`}
            className="px-5 py-2.5 border border-border rounded-lg font-medium hover:border-primary/40 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            {locale === 'en' ? 'Home' : locale === 'ru' ? 'Главная' : 'Ana səhifə'}
          </Link>
        </div>
      </div>
    </main>
  );
}
