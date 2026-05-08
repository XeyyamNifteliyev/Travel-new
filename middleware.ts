import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = [
  '/',
  '/countries',
  '/cities',
  '/places',
  '/blog',
  '/tours',
  '/flights',
  '/hotels',
  '/visa',
  '/companions',
  '/videos',
  '/ai-planner',
  '/auth',
  '/restaurants',
  '/news',
];

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(az|ru|en)/, '') || '/';
  return PUBLIC_PATHS.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + '/')
  );
}

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  if (isPublicPath(request.nextUrl.pathname)) {
    return intlResponse;
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  response.cookies.getAll().forEach(({ name, value }) => {
    intlResponse.cookies.set(name, value);
  });

  if (!user) {
    const locale = request.nextUrl.pathname.match(/^\/(az|ru|en)/)?.[1] || 'az';
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
