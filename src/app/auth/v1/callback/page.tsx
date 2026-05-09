import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

interface AuthCallbackPageProps {
  searchParams: Promise<{ locale?: string }>;
}

function normalizeLocale(value?: string) {
  return value && ['az', 'ru', 'en'].includes(value) ? value : 'az';
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const cookieStore = await cookies();
  const params = await searchParams;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = normalizeLocale(params.locale || localeCookie?.value);

  if (session) {
    redirect(`/${locale}`);
  }

  redirect(`/${locale}/auth/login`);
}
