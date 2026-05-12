import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from 'sonner';
import { ScrollProgress } from '@/components/layout/scroll-progress';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        <ScrollProgress />
        <Header />
        <main id="main-content" className="flex-1 overflow-x-hidden">{children}</main>
        <Footer locale={locale} />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-surface)',
            color: 'var(--color-txt)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          },
        }}
        richColors
      />
    </NextIntlClientProvider>
  );
}